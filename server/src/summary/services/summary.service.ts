import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { ISummaryService } from './summary-service.interface';
import { SummaryRepository } from '../repositories/summary.repository';
import { RouteRepository } from '../repositories/route.repository';
import { StationRepository } from '../repositories/station.repository';
import { PillarRepository } from '../repositories/pillar.repository';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import {
    CreatePillarCategoryDto,
    CreatePillarDto,
    CreatePillarGroupDto,
    CreatePillarMaterialDto,
    CreateRouteDto,
    CreateStationDto,
    CreateSummaryDto,
} from '../dtos/request/create-summary.dto';
import { IProjectService } from '@/project-management/project/services/project-service.interface';
import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { CustomException } from '@/shared/exceptions/custom.exception';
import { SummaryError } from '../enums/summary-error.enum';
import { PillarCategoryRepository } from '../repositories/pillar-category.repository';
import { PillarGroupRepository } from '../repositories/pillar-group.repository';
import { PillarMaterialRepository } from '../repositories/pillar-material.repository';
import { SummaryDetailResponseDataDto } from '../dtos/response/summary-detail-response.dto';
import { GetSummaryByProjectDto } from '../dtos/request/get-summary-by-project.dto';
import { PillarGroupTypeExcel } from '../enums/pillar-group-type-excel.enum';
import { UpdateSummaryDto } from '../dtos/request/update-summary.dto';
import { Route } from '../schemas/route.schema';
import { Station } from '../schemas/station.schema';
import { Pillar } from '../schemas/pillar.schema';
import { PillarGroup } from '../schemas/pillar-group.schema';
import { PillarCategory } from '../schemas/pillar-category.schema';
import { Summary } from '../schemas/summary.schema';

@Injectable()
export class SummaryService implements ISummaryService {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly summaryRepository: SummaryRepository,
        private readonly routeRepository: RouteRepository,
        private readonly stationRepository: StationRepository,
        private readonly pillarRepository: PillarRepository,
        private readonly pillarGroupRepository: PillarGroupRepository,
        private readonly pillarCategoryRepository: PillarCategoryRepository,
        private readonly pillarMaterialRepository: PillarMaterialRepository,
        @Inject(forwardRef(() => IProjectService)) private readonly projectService: IProjectService,
    ) {}

    // [PUT] /summary
    async updateSummary(updateSummaryDto: UpdateSummaryDto): Promise<boolean> {
        this.logger.info('[UPDATE SUMMARY], updateSummaryDto', updateSummaryDto);

        const { userId, projectId, routes } = updateSummaryDto;

        await this._validateSummaryToUpdate(projectId, userId);

        // Create nested sub documents
        const routesData = await this._createNestedSummary(routes);

        await this._createSummary({
            project: projectId,
            isOriginal: false,
            routes: routesData,
        });

        return true;
    }

    // [GET] /summary?projectId=
    async getSummaryDetail(filters: GetSummaryByProjectDto): Promise<SummaryDetailResponseDataDto[]> {
        this.logger.info('[GET SUMMARY DETAIL BY PROJECT], filters', filters);

        return this._getSummaryForProject(filters.projectId);
    }

    // [POST] /summary
    async createSummary(createSummaryDto: CreateSummaryDto): Promise<boolean> {
        this.logger.info('[CREATE SUMMARY], createSummaryDto', createSummaryDto);

        const { userId, projectId, routes } = createSummaryDto;

        await this._validateSummaryToCreate(projectId, userId);

        // Create nested sub documents
        const routesData = await this._createNestedSummary(routes);

        await Promise.all([
            this._createSummary({
                project: projectId,
                isOriginal: true,
                routes: routesData,
            }),
            this._createSummary({
                project: projectId,
                isOriginal: false,
                routes: routesData,
            }),
        ]);

        return true;
    }

    // ============================ START COMMON FUNCTION ============================
    async _validateSummaryToUpdate(projectId: string, userId: string): Promise<boolean> {
        // Check User belong to Summary or not
        await this._checkUserBelongToSummary(projectId, userId);

        // Check existed summary
        const summaries = await this._getSummaryForProject(projectId);

        const originalSummary = summaries.find((summary) => summary.isOriginal);
        const summary = summaries.find((summary) => !summary.isOriginal);
        if (!summary) {
            throw new CustomException({
                message: SummaryError.SUMMARY_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // If nested Summary does not match, delete all nested of updated Summary
        const isSummaryMatch = await this._isSummaryMatch(originalSummary, summary);
        if (!isSummaryMatch) {
            await this._deleteNestedSummary(summary.routes);
        }

        await this.summaryRepository.deleteOne({ _id: summary._id });

        return true;
    }

    async _validateSummaryToCreate(projectId: string, userId: string): Promise<boolean> {
        // Check User belong to Project or not
        await this._checkUserBelongToSummary(projectId, userId);

        // Check exist summary
        const existedSummaries = await this._getSummaryForProject(projectId);

        // Filter summaries based on isOriginal property
        const originalSummaries = existedSummaries.filter((summary) => summary.isOriginal === true);
        const nonOriginalSummaries = existedSummaries.filter((summary) => summary.isOriginal === false);

        // Check if there is exactly one original and one non-original summary
        const hasOriginalAndNonOriginal = originalSummaries.length === 1 && nonOriginalSummaries.length === 1;
        if (hasOriginalAndNonOriginal) {
            throw new CustomException({
                message: SummaryError.SUMMARY_EXISTED,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        return true;
    }

    private async _isSummaryMatch(originalSummary: Summary, summary: Summary) {
        const originalRouteds = originalSummary.routes.map((route) => route._id.toString());
        const routesIds = summary.routes.map((route) => route._id.toString());

        // Check if both arrays have the same length
        if (originalRouteds.length !== routesIds.length) {
            return false;
        }

        // Check if all elements in the first array are present in the second array
        return originalRouteds.every((id) => routesIds.includes(id));
    }

    private async _deleteNestedSummary(routes: Route[]): Promise<void> {
        const stationIds: any[] = [];
        const pillarIds: any[] = [];
        const pillarGroupIds: any[] = [];
        const pillarCategoryIds: any[] = [];
        const pillarMaterialIds: any[] = [];

        await Promise.all(
            routes.map(async (route: Route) => {
                stationIds.push(route.stations.map((station) => station._id.toString()));

                route.stations.map(async (station: Station) => {
                    pillarIds.push(station.pillars.map((pillar) => pillar._id.toString()));

                    station.pillars.map(async (pillar: Pillar) => {
                        pillarGroupIds.push(pillar.groups.map((group) => group._id.toString()));

                        pillar.groups.map(async (pillarGroup: PillarGroup) => {
                            pillarCategoryIds.push(pillarGroup.categories.map((category) => category._id.toString()));

                            pillarGroup.categories.map(async (pillarCategory: PillarCategory) => {
                                pillarMaterialIds.push(
                                    pillarCategory.materials.map((material) => material._id.toString()),
                                );
                            });
                        });
                    });
                });
            }),
        );

        await Promise.all([
            this.pillarMaterialRepository.deleteMany({ _id: { $in: pillarMaterialIds.flat() } }),
            this.pillarCategoryRepository.deleteMany({ _id: { $in: pillarCategoryIds.flat() } }),
            this.pillarGroupRepository.deleteMany({ _id: { $in: pillarGroupIds.flat() } }),
            this.pillarRepository.deleteMany({ _id: { $in: pillarIds.flat() } }),
            this.stationRepository.deleteMany({ _id: { $in: stationIds.flat() } }),
            this.routeRepository.deleteMany({ _id: { $in: routes.map((route) => route._id.toString()) } }),
        ]);
    }

    private async _updatePillarIncrementDistance(routeIds: string[]): Promise<void> {
        const routes = await this.routeRepository.findAll(
            {
                _id: { $in: routeIds },
            },
            null,
            {
                populate: {
                    path: 'stations',
                    populate: {
                        path: 'pillars',
                        options: { sort: { position: 1 } },
                    },
                    options: { sort: { position: 1 } },
                },
            },
        );

        await Promise.all(
            routes.map(async (route: Route) => {
                route.stations.map(async (station: Station) => {
                    let increment: number = 0;
                    station.pillars.map(async (pillar: Pillar, index: number) => {
                        if (index === 0) {
                            increment = pillar?.distance | 0;
                        } else {
                            increment = pillar?.distance + increment;
                        }

                        // Save the updated pillar
                        await this.pillarRepository.updateOne({ _id: pillar._id }, { incrementDistance: increment });
                    });
                });
            }),
        );
    }

    private async _getSummaryForProject(projectId: string): Promise<Summary[]> {
        return this.summaryRepository.findAll({ project: projectId }, null, {
            populate: {
                path: 'routes',
                populate: {
                    path: 'stations',
                    populate: {
                        path: 'pillars',
                        populate: {
                            path: 'groups',
                            populate: {
                                path: 'categories',
                                populate: [
                                    {
                                        path: 'category',
                                    },
                                    {
                                        path: 'materials',
                                        populate: {
                                            path: 'material',
                                        },
                                    },
                                ],
                                options: { sort: { position: 1 } },
                            },
                            options: { sort: { position: 1 } },
                        },
                        options: { sort: { position: 1 } },
                    },
                    options: { sort: { position: 1 } },
                },
                options: { sort: { position: 1 } },
            },
        });
    }

    private async _checkUserBelongToSummary(projectId: string, userId: string): Promise<boolean> {
        // Check exist project
        const existedProject = await this.projectService._findByIdProject(projectId, null, { populate: 'members' });
        if (!existedProject) {
            throw new CustomException({
                message: ProjectError.PROJECT_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Check User belong to Project or not
        const member = existedProject.members.find((member) => member.user._id.toString() === userId);
        if (!member) {
            throw new CustomException({
                message: ProjectError.USER_NOT_BELONG_TO_PROJECT,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        return true;
    }

    async _createNestedSummary(routes: CreateRouteDto[]): Promise<Route[]> {
        const routesData = await Promise.all(
            routes.map(async (routeDto: CreateRouteDto) => {
                const { stations, ...restDto } = routeDto;

                // Populate stations
                const stationsData = await Promise.all(
                    stations.map(async (stationDto: CreateStationDto) => {
                        const { pillars, ...restDto } = stationDto;

                        // Populate pillars
                        const pillarsData = await Promise.all(
                            pillars.map(async (pillarDto: CreatePillarDto) => {
                                const { groups, ...restDto } = pillarDto;

                                // Populate pillar groups
                                const pillarGroupsData = await Promise.all(
                                    groups.map(async (pillarGroupDto: CreatePillarGroupDto) => {
                                        const { categories, ...restDto } = pillarGroupDto;

                                        // Populate pillar categories
                                        const pillarCategoriesData = await Promise.all(
                                            categories.map(async (pillarCategoryDto: CreatePillarCategoryDto) => {
                                                const { categoryId, position, materials } = pillarCategoryDto;

                                                // Populate pillar materials
                                                const pillarMaterialsData = await Promise.all(
                                                    materials.map(
                                                        async (pillarMaterialDto: CreatePillarMaterialDto) => {
                                                            const { materialId, ...restDto } = pillarMaterialDto;

                                                            return this.pillarMaterialRepository.create({
                                                                material: materialId,
                                                                ...restDto,
                                                            });
                                                        },
                                                    ),
                                                );

                                                return this.pillarCategoryRepository.create({
                                                    category: categoryId,
                                                    position,
                                                    materials: pillarMaterialsData,
                                                });
                                            }),
                                        );

                                        return this.pillarGroupRepository.create({
                                            ...restDto,
                                            name: PillarGroupTypeExcel[restDto.type.toUpperCase()],
                                            categories: pillarCategoriesData,
                                        });
                                    }),
                                );

                                return this.pillarRepository.create({ ...restDto, groups: pillarGroupsData });
                            }),
                        );

                        return this.stationRepository.create({ ...restDto, pillars: pillarsData });
                    }),
                );

                return this.routeRepository.create({ ...restDto, stations: stationsData });
            }),
        );

        // Update increment distance in pillar
        await this._updatePillarIncrementDistance(routesData.map((route) => route._id.toString()));

        return routesData;
    }

    async _createSummary(doc: Summary | any): Promise<Summary> {
        return this.summaryRepository.create(doc);
    }

    async _getSummaryByOriginal(projectId: string, isOriginal: boolean): Promise<Summary> {
        return this.summaryRepository.findOne({ project: projectId, isOriginal }, null, {
            populate: [
                {
                    path: 'project',
                },
                {
                    path: 'routes',
                    populate: {
                        path: 'stations',
                        populate: {
                            path: 'pillars',
                            populate: {
                                path: 'groups',
                                populate: {
                                    path: 'categories',
                                    populate: [
                                        {
                                            path: 'category',
                                        },
                                        {
                                            path: 'materials',
                                            populate: {
                                                path: 'material',
                                            },
                                        },
                                    ],
                                    options: { sort: { position: 1 } },
                                },
                                options: { sort: { position: 1 } },
                            },
                            options: { sort: { position: 1 } },
                        },
                        options: { sort: { position: 1 } },
                    },
                    options: { sort: { position: 1 } },
                },
            ],
        });
    }
    // ============================ END COMMON FUNCTION ============================
}

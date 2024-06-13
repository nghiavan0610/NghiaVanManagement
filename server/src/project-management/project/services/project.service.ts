import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { IProjectService } from './project-service.interface';
import { CreateProjectDto } from '../dtos/request/create-project.dto';
import { ProjectDetailResponseDataDto } from '../dtos/response/project-detail-response.dto';
import { ProjectRepository } from '../repositories/project.repository';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { Project } from '../schemas/project.schema';
import { IUserService } from '@/user/services/user-service.interface';
import { CustomException } from '@/shared/exceptions/custom.exception';
import { ProjectError } from '../enums/project-error.enum';
import { UpdateProjectDto } from '../dtos/request/update-project.dto';
import { DeleteProjectDto } from '../dtos/request/delete-project.dto';
import { ModifyProjectMemberDto } from '../dtos/request/modify-project-member.dto';
import {
    FilterQuery,
    ProjectionType,
    QueryOptions,
    UpdateQuery,
    UpdateWithAggregationPipeline,
    UpdateWriteOpResult,
} from 'mongoose';
import { MemberRole } from '../../member/schemas/member.schema';
import { IMemberService } from '@/project-management/member/services/member-service.interface';
import { ISummaryService } from '@/summary/services/summary-service.interface';
import { Summary } from '@/summary/schemas/summary.schema';

@Injectable()
export class ProjectService implements IProjectService {
    constructor(
        private readonly projectRepository: ProjectRepository,
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        @Inject(IUserService) private readonly userService: IUserService,
        @Inject(IMemberService) private readonly memberService: IMemberService,
        @Inject(forwardRef(() => ISummaryService)) private readonly summaryService: ISummaryService,
    ) {}

    // [DELETE] /projects/:id
    async deleteProject(deleteProjectDto: DeleteProjectDto): Promise<boolean> {
        this.logger.info('[DELETE PROJECT], deleteProjectDto', deleteProjectDto);

        const { userId, id } = deleteProjectDto;

        const project = await this.projectRepository.findById(id, null, { populate: 'members' });
        if (!project) {
            throw new CustomException({
                message: ProjectError.PROJECT_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Check if the user is the manager of this project
        await this._validateProjectMember(project, userId, [MemberRole.manager]);

        // Delete project
        await this.projectRepository.deleteOne({ _id: id });

        return true;
    }

    // [PUT] /projects/:id/members
    async modifyProjectMember(modifyProjectMemberDto: ModifyProjectMemberDto): Promise<boolean> {
        this.logger.info('[MODIFY PROJECT MEMBER], modifyProjectMemberDto', modifyProjectMemberDto);

        const { userId, id, ...restDto } = modifyProjectMemberDto;

        const project = await this.projectRepository.findById(id, null, { populate: 'members' });
        if (!project) {
            throw new CustomException({
                message: ProjectError.PROJECT_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Check if the user is the manager of this project
        await this._validateProjectMember(project, userId, [MemberRole.manager, MemberRole.member]);

        // New project members
        const [manager, members] = await Promise.all([
            this.memberService._findOneAndUpdateMember(
                { user: restDto.manager, role: MemberRole.manager },
                { user: restDto.manager, role: MemberRole.manager },
                { upsert: true },
            ),
            restDto.members.map(async (member) => {
                await this.memberService._findOneAndUpdateMember(
                    { user: member, role: MemberRole.member },
                    { user: member, role: MemberRole.member },
                    { upsert: true },
                );
            }),
        ]);

        // Update new members to Project
        await this.projectRepository.updateOne({ _id: id }, { members: [manager, ...members] });

        return true;
    }

    // [PUT] /projects/:id/detail
    async updateProject(updateProjectDto: UpdateProjectDto): Promise<boolean> {
        this.logger.info('[UPDATE PROJECT DETAIL], updateProjectDto', updateProjectDto);

        const { userId, id, ...restDto } = updateProjectDto;

        const project = await this.projectRepository.findById(id, null, { populate: 'members' });
        if (!project) {
            throw new CustomException({
                message: ProjectError.PROJECT_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Check if the user is the manager of this project
        await this._validateProjectMember(project, userId, [MemberRole.manager, MemberRole.member]);

        // Check existed attribute
        const [checkName, checkCode] = await Promise.all([
            this._getProjectForValidate({ name: restDto.name }, id),
            this._getProjectForValidate({ code: restDto.code }, id),
        ]);

        if (checkName) {
            throw new CustomException({
                message: ProjectError.PROJECT_NAME_EXISTED,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }
        if (checkCode) {
            throw new CustomException({
                message: ProjectError.PROJECT_CODE_EXISTED,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        await this.projectRepository.updateOne({ _id: id }, restDto);

        return true;
    }

    // [GET] /projects/my-project
    async getMyProjectList(userId: string): Promise<ProjectDetailResponseDataDto[]> {
        this.logger.info('[GET MY PROJECT LIST]');

        const members = await this.memberService._findAllMember({ user: userId });
        return this.projectRepository.findAll({ members: { $in: members } }, null, {
            populate: {
                path: 'members',
                populate: {
                    path: 'user',
                    populate: {
                        path: 'job',
                    },
                },
            },
        });
    }

    // [GET] /projects/:id
    async getProjectDetail(id: string): Promise<ProjectDetailResponseDataDto> {
        this.logger.info('[GET PROJECT DETAIL], id', id);

        const project = await this.projectRepository.findById(id, null, {
            populate: {
                path: 'members',
                populate: {
                    path: 'user',
                    populate: {
                        path: 'job',
                    },
                },
            },
        });
        if (!project) {
            throw new CustomException({
                message: ProjectError.PROJECT_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // calculate process
        const summary = await this.summaryService._getSummaryByOriginal(project._id.toString(), false);
        let progress: number = 0;
        if (summary) {
            progress = await this._calculateProjectProgress(summary);
        }

        const result: any = project;
        result.progress = progress;

        return result;
    }

    // [GET] /projects
    async getProjectList(): Promise<ProjectDetailResponseDataDto[]> {
        this.logger.info('[GET PROJECT LIST]');

        return this.projectRepository.findAll(null, null, {
            populate: {
                path: 'members',
                populate: {
                    path: 'user',
                    populate: {
                        path: 'job',
                    },
                },
            },
        });
    }

    // [POST] /projects
    async createProject(createProjectDto: CreateProjectDto): Promise<ProjectDetailResponseDataDto> {
        this.logger.info('[CREATE PROJECT], createProjectDto', createProjectDto);

        const { userId, ...restDto } = createProjectDto;

        // Create new Project
        const project = await this.projectRepository.create(restDto);

        // Create Member
        await this.memberService._findOneAndUpdateMember(
            { user: userId, role: MemberRole.manager },
            { user: userId, role: MemberRole.manager },
            { upsert: true },
        );

        // Update Porject to relation User
        await this.userService._updateUser({ _id: userId }, { $push: { projects: project._id } });

        return project;
    }

    // ============================ START COMMON FUNCTION ============================
    private async _calculateProjectProgress(summary: Summary): Promise<number> {
        let total: number = 0;
        let done: number = 0;

        for (const { stations } of summary.routes) {
            for (const { pillars } of stations) {
                for (const { groups } of pillars) {
                    for (const { categories } of groups) {
                        for (const { materials } of categories) {
                            for (const material of materials) {
                                if (material.quantity) total++;
                                if (material.quantity && material.isDone) done++;
                            }
                        }
                    }
                }
            }
        }

        const progress = parseFloat(((done / total) * 100).toFixed(2)) || 0;
        return progress;
    }

    private async _validateProjectMember(project: Project, userId: string, roles: MemberRole[]): Promise<boolean> {
        const member = project.members.find((member) => member.user._id.toString() === userId);
        if (!member || !roles.includes(member.role)) {
            throw new CustomException({
                message: ProjectError.PROJECT_NOT_PERMISSION,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        return true;
    }

    async _updateProject(
        filter?: FilterQuery<Project>,
        update?: UpdateWithAggregationPipeline | UpdateQuery<Project>,
        options?: any,
    ): Promise<UpdateWriteOpResult> {
        return this.projectRepository.updateMany(filter, update, options);
    }

    async _getProjectForValidate(filter: FilterQuery<Project>, exceptId?: string): Promise<Project> {
        const query = exceptId ? { _id: { $ne: exceptId }, ...filter } : { ...filter };

        return this.projectRepository.findOne(query);
    }

    async _findByIdProject(
        id: string,
        projection?: ProjectionType<Project>,
        options?: QueryOptions<Project>,
    ): Promise<Project> {
        return this.projectRepository.findById(id, projection, options);
    }
    // ============================ END COMMON FUNCTION ============================
}

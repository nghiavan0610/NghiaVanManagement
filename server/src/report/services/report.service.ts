import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IReportService } from './report-service.interface';
import { ExportReportDto } from '@/export/dtos/request/export-report.dto';
import { IProjectService } from '@/project-management/project/services/project-service.interface';
import { CustomException } from '@/shared/exceptions/custom.exception';
import {
    SUMMARY_REPORT_PYC_NT,
    SUMMARY_REPORT_BE_TONG,
    SUMMARY_REPORT_MONG,
    SUMMARY_REPORT_TRU,
    SUMMARY_REPORT_NEO,
    SUMMARY_REPORT_KEO_DAY,
    SUMMARY_REPORT_TIEP_DIA,
    SUMMARY_REPORT_TRAM,
    SUMMARY_REPORT_THU_HOI,
    SUMMARY_REPORT_LAP_DAT_PD,
    REPORT_KEO_DAY_EXCEPT_CONDITION,
    REPORT_TRAM_INCLUDE_CONDITION,
    REPORT_LAP_DAT_PD_INCLUDE_CONDITION,
    REPORT_LAP_DAT_PD_INCLUDE_CONDITION_WITH_DAY_DAN,
    REPORT_LAP_DAT_PD_INCLUDE_CONDITION_WITH_PHU_KIEN,
} from '@/summary/constants/summary-report.constant';
import { SummaryError } from '@/summary/enums/summary-error.enum';
import { PillarGroupType } from '@/summary/schemas/pillar-group.schema';
import moment from 'moment';
import { ReportTemplate } from '../enums/report-template.enum';
import { ReportDataDto } from '../dtos/request/report-data.dto';
import { ReportRouteDataDto } from '../dtos/request/report-route.dto';
import {
    ExportReportDataDto,
    ExportReportGroupDto,
    ExportReportPillarDto,
    ExportReportPillarMaterialDto,
    ExportReportRouteDataDto,
    ExportReportStationDto,
} from '../dtos/request/export-report-data.dto';

@Injectable()
export class ReportService implements IReportService {
    constructor(@Inject(IProjectService) private readonly projectService: IProjectService) {}

    async _createReportData(filters: ExportReportDto): Promise<ReportDataDto> {
        const project = await this.projectService._findByIdProject(filters.projectId);

        // const categories = this._getCategoriesByTemplate(filters.templateName);

        // let exportData: ExportReportDataDto;
        // if (filters.templateName.includes(ReportTemplate.BM_ThuHoi)) {
        //     exportData = await this._createExportReportRouteData(filters.routes, categories, PillarGroupType.recalled);
        // } else {
        //     exportData = await this._createExportReportRouteData(filters.routes, categories, PillarGroupType.new);
        // }

        const exportData = await this._createExportReportRouteData(filters.routes, filters.templateName);

        const data = {
            date: moment(Date.now()).format('[ngày] DD [tháng] MM [năm] YYYY'),
            startedAt: moment(project.startedAt).format('[ngày] DD [tháng] MM [năm] YYYY'),
            project: project,
            export: exportData,
        };

        return data;
    }

    private async _createExportReportRouteData(
        routes: ReportRouteDataDto[],
        templateName: string,
    ): Promise<ExportReportDataDto> {
        const categories = this._getCategoriesByTemplate(templateName);

        const groupType = templateName.includes(ReportTemplate.BM_ThuHoi)
            ? PillarGroupType.recalled
            : PillarGroupType.new;

        const data: ExportReportDataDto = {
            totalQuantity: 0,
            totalOriginalQuantity: 0,
            routes: [],
        };

        for (const route of routes) {
            let routeQuantity: number = 0;
            let routeOriginalQuantity: number = 0;
            let routeDistance: number = 0;

            const routeData: ExportReportRouteDataDto = {
                routeName: route.name,
                routeQuantity: 0,
                routeOriginalQuantity: 0,
                routeDistance: 0,
                stations: [],
            };

            for (const station of route.stations) {
                const stationData: ExportReportStationDto = { stationName: station.name, groups: [], pillars: [] };

                const reportGroup: Map<string, ExportReportGroupDto> = new Map<
                    string,
                    {
                        groupMaterial: string;

                        groupPillar: string[];
                        firstPillar: string;
                        lastPillar: string;

                        groupDistance: number;

                        groupQuantity: number;
                        groupOriginalQuantity: number;
                        groupComment: string[];
                    }
                >();

                for (const pillar of station.pillars) {
                    const pillarData: ExportReportPillarDto = { pillarName: pillar.name, materials: [] };

                    for (const pillarGroup of pillar.groups) {
                        if (pillarGroup.type !== groupType) {
                            continue;
                        }

                        for (const pillarCategory of pillarGroup.categories) {
                            // Filter pillar category not include in Report Template
                            if (!categories.includes(pillarCategory.category._id.toString())) {
                                continue;
                            }

                            for (const pillarMaterial of pillarCategory.materials) {
                                // Filter pillar material should be export or not
                                if (!pillarMaterial.export) {
                                    continue;
                                }

                                const materialId = pillarMaterial.material._id.toString();
                                const materialName = pillarMaterial.material.name;

                                // if (
                                //     templateName.includes(ReportTemplate.BM_KeoDay) &&
                                //     pillarMaterial.material.name.toLowerCase().includes(REPORT_KEO_DAY_EXCEPT_CONDITION)
                                // ) {
                                //     continue;
                                // }

                                // if (
                                //     templateName.includes(ReportTemplate.BM_Tram) &&
                                //     !pillarMaterial.material.name.toLowerCase().includes(REPORT_TRAM_INCLUDE_CONDITION)
                                // ) {
                                //     continue;
                                // }

                                // if (
                                //     templateName.includes(ReportTemplate.BM_LapDatPD) &&
                                //     !pillarMaterial.material.name
                                //         .toLowerCase()
                                //         .includes(REPORT_LAP_DAT_PD_INCLUDE_CONDITION)
                                // ) {
                                //     continue;
                                // } else {
                                //     if (pillarCategory.category._id.toString() === '6613f73475d9603a8ea196d1') {
                                //         const regexPattern = new RegExp(
                                //             REPORT_LAP_DAT_PD_INCLUDE_CONDITION_WITH_DAY_DAN.map(
                                //                 (term) => `(?:${term})`,
                                //             ).join('|'),
                                //             'i',
                                //         );

                                //         const matchesDayDan = regexPattern.test(materialName);
                                //         if (!matchesDayDan) {
                                //             continue;
                                //         }
                                //     }
                                //     if (pillarCategory.category._id.toString() === '6613f74475d9603a8ea196e1') {
                                //         const regexPattern = new RegExp(
                                //             REPORT_LAP_DAT_PD_INCLUDE_CONDITION_WITH_PHU_KIEN.map(
                                //                 (term) => `(?:${term})`,
                                //             ).join('|'),
                                //             'i',
                                //         );

                                //         const matchesPhuKien = regexPattern.test(materialName);
                                //         if (!matchesPhuKien) {
                                //             continue;
                                //         }
                                //     }
                                // }

                                const matchesAnyRegex = (text: string, patterns: string[]): boolean => {
                                    const regexPattern = new RegExp(
                                        patterns.map((term) => `(?:${term})`).join('|'),
                                        'i',
                                    );
                                    return regexPattern.test(text);
                                };

                                if (
                                    (templateName.includes(ReportTemplate.BM_KeoDay) &&
                                        materialName.includes(REPORT_KEO_DAY_EXCEPT_CONDITION)) ||
                                    (templateName.includes(ReportTemplate.BM_Tram) &&
                                        !materialName.includes(REPORT_TRAM_INCLUDE_CONDITION)) ||
                                    (templateName.includes(ReportTemplate.BM_LapDatPD) &&
                                        !materialName.includes(REPORT_LAP_DAT_PD_INCLUDE_CONDITION))
                                ) {
                                    continue;
                                }

                                if (
                                    pillarCategory.category._id.toString() === '6613f73475d9603a8ea196d1' &&
                                    !matchesAnyRegex(materialName, REPORT_LAP_DAT_PD_INCLUDE_CONDITION_WITH_DAY_DAN)
                                ) {
                                    continue;
                                }

                                if (
                                    pillarCategory.category._id.toString() === '6613f74475d9603a8ea196e1' &&
                                    !matchesAnyRegex(materialName, REPORT_LAP_DAT_PD_INCLUDE_CONDITION_WITH_PHU_KIEN)
                                ) {
                                    continue;
                                }

                                if (reportGroup.has(materialId)) {
                                    // If material exists, update quantity and add pillar name
                                    const existingMaterial = reportGroup.get(materialId);
                                    existingMaterial.groupPillar.push(pillar.name);
                                    existingMaterial.lastPillar = pillar.name;
                                    existingMaterial.groupDistance += pillar.distance;
                                    existingMaterial.groupQuantity += pillarMaterial.quantity;
                                    existingMaterial.groupOriginalQuantity += pillarMaterial.originalQuantity;
                                    pillarMaterial.comment
                                        ? existingMaterial.groupComment.push(pillarMaterial.comment)
                                        : null;
                                } else {
                                    // If material doesn't exist, create a new entry
                                    reportGroup.set(materialId, {
                                        groupMaterial: materialName,
                                        groupPillar: [pillar.name],
                                        firstPillar: pillar.name,
                                        lastPillar: pillar.name,
                                        groupDistance: pillar.distance,
                                        groupQuantity: pillarMaterial.quantity,
                                        groupOriginalQuantity: pillarMaterial.originalQuantity,
                                        groupComment: [pillarMaterial.comment],
                                    });
                                }

                                const materialData: ExportReportPillarMaterialDto = {
                                    materialName: pillarMaterial.material.name,
                                    materialQuantity: pillarMaterial.quantity,
                                    materialOriginalQuantity: pillarMaterial.originalQuantity,
                                    materialComment: pillarMaterial?.comment ?? '',
                                };
                                pillarData.materials.push(materialData);

                                // Update route quantities
                                routeQuantity += pillarMaterial.quantity ?? 0;
                                routeOriginalQuantity += pillarMaterial.originalQuantity ?? 0;
                                routeDistance += pillar.distance ?? 0;
                            }
                        }
                    }

                    if (pillarData.materials.length > 0) {
                        stationData.pillars.push(pillarData);
                    }
                }

                // Convert map entries to material data and add to station data
                for (const [, group] of reportGroup) {
                    stationData.groups.push(group);
                }

                routeData.stations.push(stationData);
            }
            // Update routeData quantities
            routeData.routeQuantity = routeQuantity;
            routeData.routeOriginalQuantity = routeOriginalQuantity;
            routeData.routeDistance = routeDistance;

            // Update data quantities
            data.totalQuantity += routeQuantity;
            data.totalOriginalQuantity += routeOriginalQuantity;

            if (routeData.stations.length > 0) {
                data.routes.push(routeData);
            }
        }

        return data;
    }

    private _getCategoriesByTemplate(templateName: string): string[] {
        let categories: string[] = [];
        switch (true) {
            case new RegExp(`^${ReportTemplate.PYC_NT}.*`, 'i').test(templateName):
                categories = SUMMARY_REPORT_PYC_NT;
                break;
            case new RegExp(`^${ReportTemplate.BM_Betong}.*`, 'i').test(templateName):
                categories = SUMMARY_REPORT_BE_TONG;
                break;
            case new RegExp(`^${ReportTemplate.BM_Mong}.*`, 'i').test(templateName):
                categories = SUMMARY_REPORT_MONG;
                break;
            case new RegExp(`^${ReportTemplate.BM_Tru}.*`, 'i').test(templateName):
                categories = SUMMARY_REPORT_TRU;
                break;
            case new RegExp(`^${ReportTemplate.BM_Neo}.*`, 'i').test(templateName):
                categories = SUMMARY_REPORT_NEO;
                break;
            case new RegExp(`^${ReportTemplate.BM_KeoDay}.*`, 'i').test(templateName):
                categories = SUMMARY_REPORT_KEO_DAY;
                break;
            case new RegExp(`^${ReportTemplate.BM_TiepDia}.*`, 'i').test(templateName):
                categories = SUMMARY_REPORT_TIEP_DIA;
                break;
            case new RegExp(`^${ReportTemplate.BM_Tram}.*`, 'i').test(templateName):
                categories = SUMMARY_REPORT_TRAM;
                break;
            case new RegExp(`^${ReportTemplate.BM_LapDatPD}.*`, 'i').test(templateName):
                categories = SUMMARY_REPORT_LAP_DAT_PD;
                break;
            case new RegExp(`^${ReportTemplate.BM_ThuHoi}.*`, 'i').test(templateName):
                categories = SUMMARY_REPORT_THU_HOI;
                break;
            default:
                throw new CustomException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: SummaryError.SUMMARY_REPORT_INVALID_NAME,
                });
        }

        return categories;
    }
}

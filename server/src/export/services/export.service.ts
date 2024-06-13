import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IExportService } from './export-service.interface';
import { ExportTimesheetProjectDto } from '../dtos/request/export-timesheet-project.dto';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { Workbook, WorkSheet, getExcelCellRef } from 'excel4node';
import { CustomException } from '@/shared/exceptions/custom.exception';
import { Project } from '@/project-management/project/schemas/project.schema';
import { ExportSummaryDto } from '../dtos/request/export-summary.dto';
import { ISummaryService } from '@/summary/services/summary-service.interface';
import { Summary } from '@/summary/schemas/summary.schema';
import { SummaryError } from '@/summary/enums/summary-error.enum';
import { TIMESHEET_WORKSHEET_NAME } from '@/shared/constants/timesheet-excel.constant';
import {
    SUMMARY_EXCEL_BODY_DATA_START_ROW,
    SUMMARY_EXCEL_BODY_HEADER_START_ROW,
    SUMMARY_EXCEL_BODY_PILLAR_CATEGORY_ROW,
    SUMMARY_EXCEL_BODY_PILLAR_MATERIAL_ROW,
    SUMMARY_EXCEL_CONG_DON_COL,
    SUMMARY_EXCEL_HINH_THUC_TRU_COL,
    SUMMARY_EXCEL_KHOANG_CACH_HOAN_CONG_COL,
    SUMMARY_EXCEL_KHOANG_CACH_THIET_KE_COL,
    SUMMARY_EXCEL_KHOANG_NEO_COL,
    SUMMARY_EXCEL_PILLAR_GROUP_ROW,
    SUMMARY_EXCEL_PILLAR_START_COL,
    SUMMARY_EXCEL_SO_TRU_COL,
    SUMMARY_EXCEL_SO_TRU_HOANG_CONG_COL,
    SUMMARY_WORKSHEET_NAME,
} from '@/summary/constants/summary-excel.constant';
import { SummaryExcel } from '@/summary/enums/summary-excel.enum';
import { PillarGroupTypeExcel } from '@/summary/enums/pillar-group-type-excel.enum';
import { Route } from '@/summary/schemas/route.schema';
import { Station } from '@/summary/schemas/station.schema';
import { Pillar } from '@/summary/schemas/pillar.schema';
import { PillarGroup } from '@/summary/schemas/pillar-group.schema';
import { PillarCategory } from '@/summary/schemas/pillar-category.schema';
import { PillarMaterial } from '@/summary/schemas/pillar-material.schema';
import { ExportReportDto } from '../dtos/request/export-report.dto';
import * as path from 'path';
import * as fs from 'fs';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { ExportError } from '../enums/export-error.enum';
import { IReportService } from '@/report/services/report-service.interface';
import { ITimesheetProjectService } from '@/timesheet-management/timesheet-project/services/timesheet-project-service.interface';
import { ExportTimesheetUserDto } from '../dtos/request/export-timesheet-user.dto';
import { ITimesheetUserService } from '@/timesheet-management/timesheet-user/services/timesheet-user-service.interface';

@Injectable()
export class ExportService implements IExportService {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        @Inject(ISummaryService) private readonly summaryService: ISummaryService,
        @Inject(IReportService) private readonly reportService: IReportService,
        @Inject(ITimesheetProjectService) private readonly timesheetProjectService: ITimesheetProjectService,
        @Inject(ITimesheetUserService) private readonly timesheetUserService: ITimesheetUserService,
    ) {}

    // [POST] /export/report
    async exportReport(filters: ExportReportDto): Promise<{ fileName: string; buffer: Buffer }> {
        this.logger.info('[EXPORT REPORT], filters', {
            templateName: filters.templateName,
            projectId: filters.projectId,
        });

        const reportPrefix = filters.templateName.split('.')[0];
        const templatePath = path.join(__dirname, `../../../templates/${reportPrefix}/${filters.templateName}.docx`);
        try {
            const templateFile = fs.readFileSync(templatePath, 'binary');

            const zip = new PizZip(templateFile);
            const doc = new Docxtemplater(zip, {
                // parser: angularParser,
                paragraphLoop: true,
                linebreaks: true,
            });

            const data = await this.reportService._createReportData(filters);

            doc.setData(data);
            doc.render();

            const fileName = `${filters.templateName}-${Date.now().toString()}.docx`;

            const buffer = doc.getZip().generate({ type: 'nodebuffer' });

            return { fileName, buffer };
        } catch (error) {
            this.logger.error('[exportReport], error', error.message);
            throw new CustomException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: ExportError.EXPORT_REPORT_SOMETHING_WENT_WRONG,
            });
        }
    }

    // [GET] /export/summary?projectId=
    async exportSummary(filters: ExportSummaryDto): Promise<{ fileName: string; buffer: Buffer }> {
        this.logger.info('[EXPORT SUMMARY], filters', filters);

        try {
            const workbook = new Workbook({
                defaultFont: { size: 11, name: 'Times New Roman', color: '#000000' },
            });

            const worksheet = workbook.addWorksheet(SUMMARY_WORKSHEET_NAME);

            await this._convertSummaryToXlsxKey(worksheet, filters.projectId);

            const fileName = `summary-${Date.now().toString()}.xlsx`;

            const buffer = await workbook.writeToBuffer();

            return { fileName, buffer };
        } catch (error) {
            this.logger.error('[exportSummary], error', error.message);
            throw new CustomException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: ExportError.EXPORT_SUMMARY_SOMETHING_WENT_WRONG,
            });
        }
    }

    // [GET] /export/timesheet-project?projectId=&month=
    async exportTimesheetProject(filters: ExportTimesheetProjectDto): Promise<{ fileName: string; buffer: Buffer }> {
        this.logger.info('[EXPORT TIMESHEET PROJECT], filters', filters);

        try {
            const workbook = new Workbook({
                defaultFont: { size: 11, name: 'Times New Roman', color: '#000000' },
            });

            const worksheet = workbook.addWorksheet(TIMESHEET_WORKSHEET_NAME);

            await this.timesheetProjectService._convertTimesheetProjectListToXls(worksheet, filters);

            const fileName = `cham-cong-theo-du-an-${Date.now().toString()}.xlsx`;

            const buffer = await workbook.writeToBuffer();

            return { fileName, buffer };
        } catch (error) {
            this.logger.error('[exportTimesheetProject], error', error.message);
            throw new CustomException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: ExportError.EXPORT_TIMESHEET_SOMETHING_WENT_WRONG,
            });
        }
    }

    // [GET] /export/timesheet-user?month=
    async exportTimesheetUSer(filters: ExportTimesheetUserDto): Promise<{ fileName: string; buffer: Buffer }> {
        this.logger.info('[EXPORT TIMESHEET USER], filters', filters);

        try {
            const workbook = new Workbook({
                defaultFont: { size: 11, name: 'Times New Roman', color: '#000000' },
            });

            const worksheet = workbook.addWorksheet(TIMESHEET_WORKSHEET_NAME);

            await this.timesheetUserService._convertTimesheetUserListToXls(worksheet, filters);

            const fileName = `cham-cong-${Date.now().toString()}.xlsx`;

            const buffer = await workbook.writeToBuffer();

            return { fileName, buffer };
        } catch (error) {
            this.logger.error('[exportTimesheet], error', error.message);
            throw new CustomException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: ExportError.EXPORT_TIMESHEET_SOMETHING_WENT_WRONG,
            });
        }
    }

    // ============================ START SUMMARY FUNCTION ============================
    private async _convertSummaryToXlsxKey(worksheet: WorkSheet, projectId: string): Promise<void> {
        const summary = await this.summaryService._getSummaryByOriginal(projectId, false);
        if (!summary) {
            throw new CustomException({
                message: SummaryError.SUMMARY_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Headers
        await this._createSummaryHeaders(worksheet, summary.project);

        // Body
        const countsPerGroup: Record<
            string,
            Record<string, string[]>
        > = summary.routes[0].stations[0].pillars[0].groups.reduce((groupCounts, group) => {
            const categoryMaterials: Record<string, string[]> = {};

            group.categories.forEach((pillarCategory) => {
                categoryMaterials[pillarCategory.category.name] = pillarCategory.materials.map(
                    (pillarMaterial) => pillarMaterial.material.name,
                );
            });

            const hasMaterials = Object.values(categoryMaterials).some((materials) => materials.length > 0);

            // Only include groups with categories that have materials
            if (hasMaterials) {
                groupCounts[group.type] = categoryMaterials;
            }

            return groupCounts;
        }, {});

        const countMaterial: number = Object.values(countsPerGroup).reduce((acc, group) => {
            return acc + Object.values(group).reduce((acc, category) => acc + category.length, 0);
        }, 0);

        // Body Headers
        await this._createSummaryBodyHeaders(worksheet, countsPerGroup, countMaterial);

        // Body data
        const endRow = await this._createSummaryBodyData(worksheet, summary, countMaterial);

        // Border
        this._borderCell(
            worksheet,
            SUMMARY_EXCEL_BODY_HEADER_START_ROW,
            SUMMARY_EXCEL_SO_TRU_COL,
            endRow - 1,
            SUMMARY_EXCEL_PILLAR_START_COL + countMaterial,
        );
    }

    private async _createSummaryHeaders(worksheet: WorkSheet, project: Project): Promise<void> {
        const titleStyle = {
            font: { bold: true, size: 15 },
            alignment: { wrapText: false, horizontal: 'center', vertical: 'center' },
        };

        this._setCell(worksheet, 1, 16, SummaryExcel.HEADERS + project.code, titleStyle);
        this._setCell(worksheet, 2, 16, project.name, titleStyle);
        this._setCell(worksheet, 3, 16, project.location, { ...titleStyle, font: { bold: true, size: 13 } });
    }

    private async _createSummaryBodyHeaders(
        worksheet: WorkSheet,
        countsPerGroup: Record<string, Record<string, string[]>>,
        countMaterial: number,
    ): Promise<void> {
        const titleStyle = {
            font: { bold: true },
            alignment: { wrapText: false, horizontal: 'center', vertical: 'center' },
        };
        const rotateStyle = {
            alignment: { wrapText: false, horizontal: 'center', textRotation: 90, vertical: 'bottom' },
        };

        // Table Body Headers
        this._setCellInRange(
            worksheet,
            SUMMARY_EXCEL_BODY_HEADER_START_ROW,
            SUMMARY_EXCEL_SO_TRU_COL,
            SUMMARY_EXCEL_BODY_DATA_START_ROW - 1,
            SUMMARY_EXCEL_SO_TRU_COL,
            SummaryExcel.SO_TRU,
            rotateStyle,
        );
        this._setCellInRange(
            worksheet,
            SUMMARY_EXCEL_BODY_HEADER_START_ROW,
            SUMMARY_EXCEL_KHOANG_CACH_THIET_KE_COL,
            SUMMARY_EXCEL_BODY_DATA_START_ROW - 1,
            SUMMARY_EXCEL_KHOANG_CACH_THIET_KE_COL,
            SummaryExcel.KHOANG_CACH_THIET_KE,
            rotateStyle,
        );
        this._setCellInRange(
            worksheet,
            SUMMARY_EXCEL_BODY_HEADER_START_ROW,
            SUMMARY_EXCEL_CONG_DON_COL,
            SUMMARY_EXCEL_BODY_DATA_START_ROW - 1,
            SUMMARY_EXCEL_CONG_DON_COL,
            SummaryExcel.CONG_DON,
            rotateStyle,
        );
        this._setCellInRange(
            worksheet,
            SUMMARY_EXCEL_BODY_HEADER_START_ROW,
            SUMMARY_EXCEL_SO_TRU_HOANG_CONG_COL,
            SUMMARY_EXCEL_BODY_DATA_START_ROW - 1,
            SUMMARY_EXCEL_SO_TRU_HOANG_CONG_COL,
            SummaryExcel.SO_TRU_HOAN_CONG,
            rotateStyle,
        );
        this._setCellInRange(
            worksheet,
            SUMMARY_EXCEL_BODY_HEADER_START_ROW,
            SUMMARY_EXCEL_KHOANG_CACH_HOAN_CONG_COL,
            SUMMARY_EXCEL_BODY_DATA_START_ROW - 1,
            SUMMARY_EXCEL_KHOANG_CACH_HOAN_CONG_COL,
            SummaryExcel.KHOANG_CACH_HOAN_CONG,
            rotateStyle,
        );
        this._setCellInRange(
            worksheet,
            SUMMARY_EXCEL_BODY_HEADER_START_ROW,
            SUMMARY_EXCEL_KHOANG_NEO_COL,
            SUMMARY_EXCEL_BODY_DATA_START_ROW - 1,
            SUMMARY_EXCEL_KHOANG_NEO_COL,
            SummaryExcel.KHOANG_NEO,
            rotateStyle,
        );
        this._setCellInRange(
            worksheet,
            SUMMARY_EXCEL_BODY_HEADER_START_ROW,
            SUMMARY_EXCEL_HINH_THUC_TRU_COL,
            SUMMARY_EXCEL_BODY_DATA_START_ROW - 1,
            SUMMARY_EXCEL_HINH_THUC_TRU_COL,
            SummaryExcel.HINH_THUC_TRU,
            rotateStyle,
        );
        this._setCellInRange(
            worksheet,
            SUMMARY_EXCEL_BODY_HEADER_START_ROW,
            SUMMARY_EXCEL_PILLAR_START_COL + countMaterial,
            SUMMARY_EXCEL_BODY_DATA_START_ROW - 1,
            SUMMARY_EXCEL_PILLAR_START_COL + countMaterial,
            SummaryExcel.GHI_CHU,
            titleStyle,
        );

        // Create Pillar Group Headers
        let groupRangeTemp: number = 0;
        let categoryRangeTemp: number = 0;
        let materialRangeTemp: number = 0;

        for (const group in countsPerGroup) {
            const groupRange = Object.values(countsPerGroup[group]).reduce((total, item) => total + item.length, 0);

            this._setCellInRange(
                worksheet,
                SUMMARY_EXCEL_PILLAR_GROUP_ROW,
                SUMMARY_EXCEL_PILLAR_START_COL + groupRangeTemp,
                SUMMARY_EXCEL_PILLAR_GROUP_ROW,
                SUMMARY_EXCEL_PILLAR_START_COL + groupRange + groupRangeTemp - 1,
                PillarGroupTypeExcel[group.toUpperCase()],
                titleStyle,
            );

            for (const category in countsPerGroup[group]) {
                const categoryRange = countsPerGroup[group][category].length;

                this._setCellInRange(
                    worksheet,
                    SUMMARY_EXCEL_BODY_PILLAR_CATEGORY_ROW,
                    SUMMARY_EXCEL_PILLAR_START_COL + categoryRangeTemp,
                    SUMMARY_EXCEL_BODY_PILLAR_CATEGORY_ROW,
                    SUMMARY_EXCEL_PILLAR_START_COL + categoryRange + categoryRangeTemp - 1,
                    category,
                    titleStyle,
                );

                for (const material of countsPerGroup[group][category]) {
                    this._setCell(
                        worksheet,
                        SUMMARY_EXCEL_BODY_PILLAR_MATERIAL_ROW,
                        SUMMARY_EXCEL_PILLAR_START_COL + materialRangeTemp,
                        material,
                        rotateStyle,
                    );

                    materialRangeTemp++;
                }
                categoryRangeTemp += categoryRange;
            }
            groupRangeTemp += groupRange;
        }
    }

    private async _createSummaryBodyData(
        worksheet: WorkSheet,
        summary: Summary,
        countMaterial: number,
    ): Promise<number> {
        const nameStyle = {
            font: { bold: true },
            alignment: { wrapText: false, horizontal: 'left', vertical: 'center' },
        };
        const titleStyle = {
            font: { bold: true },
            alignment: { wrapText: false, horizontal: 'center', vertical: 'center' },
        };
        const style = {
            alignment: { wrapText: false, horizontal: 'center', vertical: 'center' },
        };

        let row: number = SUMMARY_EXCEL_BODY_DATA_START_ROW;
        await Promise.all(
            summary.routes.map(async (route: Route) => {
                this._setCellInRange(
                    worksheet,
                    row,
                    SUMMARY_EXCEL_SO_TRU_COL,
                    row,
                    SUMMARY_EXCEL_PILLAR_START_COL + countMaterial - 1,
                    route.name,
                    { ...nameStyle, font: { ...nameStyle.font, color: '#FF0000' } },
                );
                row++;

                route.stations.map(async (staion: Station) => {
                    this._setCellInRange(
                        worksheet,
                        row,
                        SUMMARY_EXCEL_SO_TRU_COL,
                        row,
                        SUMMARY_EXCEL_PILLAR_START_COL + countMaterial - 1,
                        staion.name,
                        nameStyle,
                    );
                    row++;

                    const startStationRow: number = row;
                    staion.pillars.map(async (pillar: Pillar) => {
                        this._setCell(worksheet, row, SUMMARY_EXCEL_SO_TRU_COL, pillar.name, style);
                        this._setCell(worksheet, row, SUMMARY_EXCEL_KHOANG_CACH_THIET_KE_COL, pillar.distance, style);
                        this._setCell(worksheet, row, SUMMARY_EXCEL_CONG_DON_COL, pillar.incrementDistance, style);
                        this._setCell(worksheet, row, SUMMARY_EXCEL_SO_TRU_HOANG_CONG_COL, pillar.completion, style);
                        this._setCell(
                            worksheet,
                            row,
                            SUMMARY_EXCEL_KHOANG_CACH_HOAN_CONG_COL,
                            pillar.completionDistance,
                            style,
                        );
                        this._setCell(worksheet, row, SUMMARY_EXCEL_KHOANG_NEO_COL, pillar.neoDistance, style);
                        this._setCell(worksheet, row, SUMMARY_EXCEL_HINH_THUC_TRU_COL, pillar.shape, style);

                        // Material data
                        let materialCol: number = SUMMARY_EXCEL_PILLAR_START_COL;
                        pillar.groups.map(async (pillarGroup: PillarGroup) => {
                            pillarGroup.categories.map(async (pillarCategory: PillarCategory) => {
                                pillarCategory.materials.map(async (pillarMaterial: PillarMaterial) => {
                                    if (pillarMaterial.isDone) {
                                        worksheet.cell(row, materialCol).style({
                                            fill: {
                                                type: 'pattern',
                                                patternType: 'solid',
                                                bgColor: '#b1fa32',
                                                fgColor: '#b1fa32',
                                            },
                                        });
                                    }
                                    if (pillarMaterial.comment) {
                                        worksheet.cell(row, materialCol).comment(pillarMaterial.comment);
                                    }
                                    this._setCell(worksheet, row, materialCol, pillarMaterial.quantity, style);

                                    materialCol++;
                                });
                            });
                        });

                        // Ghi chu col
                        this._setCell(
                            worksheet,
                            row,
                            SUMMARY_EXCEL_PILLAR_START_COL + countMaterial,
                            pillar.description,
                            style,
                        );

                        row++;
                    });

                    // Cong/TK/CL row
                    this._setCell(worksheet, row, SUMMARY_EXCEL_SO_TRU_COL, SummaryExcel.CONG, nameStyle);
                    this._setCell(worksheet, row + 1, SUMMARY_EXCEL_SO_TRU_COL, SummaryExcel.TK, nameStyle);
                    this._setCell(worksheet, row + 2, SUMMARY_EXCEL_SO_TRU_COL, SummaryExcel.CL, nameStyle);

                    // Cong/TK/CL style
                    worksheet
                        .cell(row, SUMMARY_EXCEL_SO_TRU_COL, row, SUMMARY_EXCEL_PILLAR_START_COL + countMaterial - 1)
                        .style({
                            ...titleStyle,
                            fill: { type: 'pattern', patternType: 'solid', bgColor: '#54de69', fgColor: '#54de69' },
                        });
                    worksheet
                        .cell(
                            row + 1,
                            SUMMARY_EXCEL_SO_TRU_COL,
                            row + 2,
                            SUMMARY_EXCEL_PILLAR_START_COL + countMaterial - 1,
                        )
                        .style({
                            ...titleStyle,
                            fill: { type: 'pattern', patternType: 'solid', bgColor: '#9bf29e', fgColor: '#9bf29e' },
                        });

                    // Cong/TK/CL data
                    for (
                        let c = SUMMARY_EXCEL_KHOANG_CACH_THIET_KE_COL;
                        c < SUMMARY_EXCEL_PILLAR_START_COL + countMaterial;
                        c++
                    ) {
                        // Cong row
                        if (c === SUMMARY_EXCEL_CONG_DON_COL) {
                            const cellAddress = getExcelCellRef(row - 1, c);
                            this._setCellFormula(worksheet, row, c, `${cellAddress}`, style);
                        } else {
                            const firstSum = getExcelCellRef(startStationRow, c);
                            const lastSum = getExcelCellRef(row - 1, c);
                            this._setCellFormula(worksheet, row, c, `SUM(${firstSum}:${lastSum})`, style);
                        }

                        // CL row
                        const congCell = getExcelCellRef(row, c);
                        const tkCell = getExcelCellRef(row + 1, c);
                        this._setCellFormula(worksheet, row + 2, c, `${congCell} - ${tkCell}`, style);
                    }

                    row += 3;
                });
            }),
        );

        return row;
    }
    // ============================ END SUMMARY FUNCTION ==============================

    // ============================ START XLSX FUNCTION ============================
    private _setCell(worksheet: WorkSheet, row: number, col: number, value: any, style: any): void {
        if (value === null) {
            return;
        }
        if (typeof value === 'number') {
            return worksheet.cell(row, col).number(value).style(style);
        }

        return worksheet.cell(row, col).string(value).style(style);
    }

    private _setCellFormula(worksheet: WorkSheet, row: number, col: number, value: string, style: any): void {
        return worksheet.cell(row, col).formula(value).style(style);
    }

    private _setCellInRange(
        worksheet: WorkSheet,
        startRow: number,
        startCol: number,
        endRow: number,
        endCol: number,
        value: any,
        style: any,
    ): void {
        if (value === null) {
            return;
        }
        if (typeof value === 'number') {
            return worksheet.cell(startRow, startCol, endRow, endCol, true).number(value).style(style);
        }

        return worksheet.cell(startRow, startCol, endRow, endCol, true).string(value).style(style);
    }

    private _borderCell(
        worksheet: WorkSheet,
        startRow: number,
        startCol: number,
        endRow: number,
        endCol: number,
    ): void {
        worksheet.cell(startRow, startCol, endRow, endCol).style({
            border: {
                left: { style: 'thin', color: '#000000' },
                right: { style: 'thin', color: '#000000' },
                top: { style: 'thin', color: '#000000' },
                bottom: { style: 'thin', color: '#000000' },
            },
        });
    }
    // ============================ END XLSX FUNCTION ============================
}

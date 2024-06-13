import { Inject, Injectable } from '@nestjs/common';
import { IImportService } from './import-service.interface';
import { ISummaryService } from '@/summary/services/summary-service.interface';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { ImportSummaryDto } from '../dtos/request/import-summary.dto';
import * as xlsx from 'xlsx';
import { SummaryExcel } from '../../summary/enums/summary-excel.enum';
import {
    SUMMARY_EXCEL_HINH_THUC_TRU_COL_INDEX,
    SUMMARY_EXCEL_KHOANG_CACH_HOAN_CONG_COL_INDEX,
    SUMMARY_EXCEL_KHOANG_CACH_THIET_KE_COL_INDEX,
    SUMMARY_EXCEL_KHOANG_NEO_COL_INDEX,
    SUMMARY_EXCEL_SO_TRU_COL_INDEX,
    SUMMARY_EXCEL_SO_TRU_HOANG_CONG_COL_INDEX,
} from '../../summary/constants/summary-excel.constant';
import { PillarGroupTypeExcel } from '@/summary/enums/pillar-group-type-excel.enum';
import {
    CreatePillarCategoryDto,
    CreatePillarDto,
    CreatePillarGroupDto,
    CreatePillarMaterialDto,
    CreateRouteDto,
    CreateStationDto,
} from '@/summary/dtos/request/create-summary.dto';
import { PillarGroupType } from '@/summary/schemas/pillar-group.schema';
import { ICategoryService } from '@/supply/category/services/category-service.interface';
import { Category } from '@/supply/category/schemas/category.schema';
import { IMaterialService } from '@/supply/material/services/material-service.interface';

@Injectable()
export class ImportService implements IImportService {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        @Inject(ISummaryService) private readonly summaryService: ISummaryService,
        @Inject(ICategoryService) private readonly categoryService: ICategoryService,
        @Inject(IMaterialService) private readonly materialService: IMaterialService,
    ) {}

    // [POST] /import/summary
    async importSummary(importSummaryDto: ImportSummaryDto): Promise<boolean> {
        const { userId, file, projectId, isOriginal } = importSummaryDto;

        this.logger.info('[IMPORT SUMMARY BY FILE], projectId', projectId);

        // Valdate Summary
        if (isOriginal) {
            await this.summaryService._validateSummaryToCreate(projectId, userId);
        } else {
            await this.summaryService._validateSummaryToUpdate(projectId, userId);
        }

        const workbook = xlsx.read(file.buffer, { type: 'buffer', cellStyles: true });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Extract excel data
        const data = await this._convertXlsxToSummary(worksheet);

        // Create Summary
        const routesData = await this.summaryService._createNestedSummary(data);

        if (isOriginal) {
            await Promise.all([
                this.summaryService._createSummary({
                    project: projectId,
                    isOriginal: true,
                    routes: routesData,
                }),
                this.summaryService._createSummary({
                    project: projectId,
                    isOriginal: false,
                    routes: routesData,
                }),
            ]);
        } else {
            await this.summaryService._createSummary({
                project: projectId,
                isOriginal: false,
                routes: routesData,
            });
        }

        return true;
    }

    private async _convertXlsxToSummary(worksheet: xlsx.WorkSheet): Promise<CreateRouteDto[]> {
        const range = xlsx.utils.decode_range(worksheet['!ref']);

        const rows: any[][] = [];
        for (let rowNum = range.s.r; rowNum <= range.e.r; ++rowNum) {
            const row: any[] = [];
            for (let colNum = range.s.c; colNum <= range.e.c; ++colNum) {
                let cell = worksheet[xlsx.utils.encode_cell({ r: rowNum, c: colNum })];

                if (!cell?.v) {
                    cell = { v: null };
                }
                row.push(cell);
            }
            rows.push(row);
        }

        // Find start Row
        const startRowIndex = rows.findIndex(
            (row) => row.findIndex((cell) => new RegExp(`^${SummaryExcel.SO_TRU}.*`, 'i').test(cell?.v)) !== -1,
        );

        // Extract to find Category range
        const newColIndex = SUMMARY_EXCEL_HINH_THUC_TRU_COL_INDEX + 1;
        const reassembledColIndex = rows[startRowIndex].findIndex((cell) =>
            new RegExp(`^${PillarGroupTypeExcel.REASSEMBLED}.*`, 'i').test(cell?.v),
        );
        const recalledColIndex = rows[startRowIndex].findIndex((cell) =>
            new RegExp(`^${PillarGroupTypeExcel.RECALLED}.*`, 'i').test(cell?.v),
        );

        const categories = await this.categoryService._getCategoryList();

        const newArr = rows[startRowIndex + 1].slice(newColIndex, reassembledColIndex);
        const reassembledArr = rows[startRowIndex + 1].slice(reassembledColIndex, recalledColIndex);
        const recalledArr = rows[startRowIndex + 1].slice(recalledColIndex, -1);

        const categoryKeys = [PillarGroupType.new, PillarGroupType.reassembled, PillarGroupType.recalled];
        const categoryRange: Record<string, Record<string, number>> = {};
        for (const key of categoryKeys) {
            const categoryCounts = this._extractCategoryCounts(
                key === PillarGroupType.new
                    ? newArr
                    : key === PillarGroupType.reassembled
                      ? reassembledArr
                      : recalledArr,
                categories,
            );
            if (categoryCounts) {
                categoryRange[key] = categoryCounts;
            }
        }

        // Extract create Route data
        const data: CreateRouteDto[] = [];
        let routeData: CreateRouteDto;
        let stationData: CreateStationDto;
        let pillarData: CreatePillarDto;
        let pillarGroupData: CreatePillarGroupDto;
        let pillarCategoryData: CreatePillarCategoryDto;
        let pillarMaterialData: CreatePillarMaterialDto;

        let routePosition: number = 1;
        let stationPosition: number = 1;
        let pillarPosition: number = 1;
        let pillarGroupPosition: number = 1;
        let pillarCategoryPosition: number = 1;
        let pillarMaterialPosition: number = 1;

        for (let r = startRowIndex + 3; r < rows.length; r++) {
            // Get Route data
            const isRoute = new RegExp(`^${SummaryExcel.ROUTE}.*`, 'i').test(rows[r][SUMMARY_EXCEL_SO_TRU_COL_INDEX].v);
            if (isRoute) {
                routeData = {
                    name: rows[r][SUMMARY_EXCEL_SO_TRU_COL_INDEX].v,
                    position: routePosition,
                    stations: [],
                };
                data.push(routeData);
                routePosition++;

                // Rest position
                stationPosition = 1;
                continue;
            }

            // Get Station Data
            const isStation = new RegExp(`^${SummaryExcel.STATION}.*`, 'i').test(
                rows[r][SUMMARY_EXCEL_SO_TRU_COL_INDEX].v,
            );
            if (isStation) {
                stationData = {
                    name: rows[r][SUMMARY_EXCEL_SO_TRU_COL_INDEX].v,
                    position: stationPosition,
                    pillars: [],
                };
                routeData.stations.push(stationData);
                stationPosition++;

                // Rest position
                pillarPosition = 1;
                continue;
            }

            // Get Pillar Data
            const isTotal = new RegExp(`^${SummaryExcel.CONG}|^${SummaryExcel.TK}|^${SummaryExcel.CL}`, 'i').test(
                rows[r][SUMMARY_EXCEL_SO_TRU_COL_INDEX].v,
            );

            if (!isTotal) {
                const description = rows[r][rows[r].length - 1].v;

                pillarData = {
                    name: rows[r][SUMMARY_EXCEL_SO_TRU_COL_INDEX].v,
                    position: pillarPosition,
                    distance: rows[r][SUMMARY_EXCEL_KHOANG_CACH_THIET_KE_COL_INDEX].v,
                    completion: rows[r][SUMMARY_EXCEL_SO_TRU_HOANG_CONG_COL_INDEX].v,
                    completionDistance: rows[r][SUMMARY_EXCEL_KHOANG_CACH_HOAN_CONG_COL_INDEX].v,
                    neoDistance: rows[r][SUMMARY_EXCEL_KHOANG_NEO_COL_INDEX].v,
                    shape: rows[r][SUMMARY_EXCEL_HINH_THUC_TRU_COL_INDEX].v,
                    // middleLine: rows
                    // lowLine: rows
                    description,
                    groups: [],
                };
                stationData.pillars.push(pillarData);
                pillarPosition++;

                // Reset position
                pillarGroupPosition = 1;

                // Get Pillar Group Data
                for (const range in categoryRange) {
                    pillarGroupData = {
                        type: range as PillarGroupType,
                        position: pillarGroupPosition,
                        categories: [],
                    };
                    pillarData.groups.push(pillarGroupData);
                    pillarGroupPosition++;

                    // Reset position
                    pillarCategoryPosition = 1;

                    // Get Pillar Category Data
                    let temp: number = 0;
                    for (const category in categoryRange[range]) {
                        pillarCategoryData = {
                            categoryId: category,
                            position: pillarCategoryPosition,
                            materials: [],
                        };
                        pillarGroupData.categories.push(pillarCategoryData);
                        pillarCategoryPosition++;

                        // Reset position
                        pillarMaterialPosition = 1;

                        const materialCounts = categoryRange[range][category];

                        // Get Pillar Material Data
                        for (let c = newColIndex + temp; c < newColIndex + temp + materialCounts; c++) {
                            let material = await this.materialService._getMaterialByName(rows[startRowIndex + 2][c].v);

                            if (!material) {
                                material = await this.materialService._createMaterial({
                                    name: rows[startRowIndex + 2][c].v,
                                    category: category,
                                });
                            }

                            pillarMaterialData = {
                                materialId: material._id.toString(),
                                quantity: rows[r][c].v,
                                comment: rows[r][c].c ? rows[r][c].c[0].t : null,
                                isDone: rows[r][c]?.s && rows[r][c].s?.patternType !== 'none' ? true : false,
                                position: pillarMaterialPosition,
                            };
                            pillarCategoryData.materials.push(pillarMaterialData);
                            pillarMaterialPosition++;
                        }
                        temp += materialCounts;
                    }
                }
            }
        }

        return data;
    }

    private _extractCategoryCounts(arr: any[], categories: Category[]): Record<string, number> | null {
        const categoryCounts: Record<string, number> = {};

        for (let i = 0; i < arr.length; i++) {
            const cellValue = arr[i].v?.toLowerCase();
            const category = categories.find((cat) => cat.name.toLowerCase() === cellValue);
            if (category) {
                const count = this._countMaterial(arr, cellValue);
                if (count !== -1) {
                    categoryCounts[category._id.toString()] = count;
                }
            }
        }
        if (Object.keys(categoryCounts).length === 0) {
            return null;
        }

        return categoryCounts;
    }

    private _countMaterial(array: any[], categoryName: string): number {
        const startIndex = array.findIndex((elem) => elem?.v?.toLowerCase() === categoryName.toLowerCase());
        let endIndex = array.findIndex((elem, index) => elem.v !== null && index > startIndex);

        if (startIndex === -1) {
            return -1;
        }
        if (endIndex === -1) {
            endIndex = array.length;
        }
        return endIndex - startIndex;
    }
}

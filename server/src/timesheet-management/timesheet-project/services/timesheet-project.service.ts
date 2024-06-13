import { HttpStatus, Injectable } from '@nestjs/common';
import { ITimesheetProjectService } from './timesheet-project-service.interface';
import { TimesheetProjectRepository } from '../repositories/timesheet-project.repository';
import { FilterQuery, ProjectionType, QueryOptions, UpdateQuery, UpdateWriteOpResult } from 'mongoose';
import { TimesheetProject } from '../schemas/timesheet-project.schema';
import { WorkSheet, getExcelCellRef } from 'excel4node';
import { DateTimeHelper } from '@/shared/helpers/date-time.helper';
import { ExportTimesheetProjectDto } from '@/export/dtos/request/export-timesheet-project.dto';
import { CustomException } from '@/shared/exceptions/custom.exception';
import { TimesheetProjectError } from '../enums/timesheet-project-error.enum';
import moment from 'moment';
import { Project } from '@/project-management/project/schemas/project.schema';
import { TimesheetExcel } from '@/shared/enums/timesheet-excel.enum';
import {
    TIMESHEET_EXCEL_BODY_HEADER_START_ROW,
    TIMESHEET_EXCEL_HOTEN_COL,
    TIMESHEET_EXCEL_COLUMNS_LENGTH_EXCEPT_MEMBER_DATA,
    TIMESHEET_EXCEL_BODY_DATA_START_COL,
    TIMESHEET_EXCEL_BODY_DATA_START_ROW,
    TIMESHEET_EXCEL_MASO_COL,
    TIMESHEET_EXCEL_MEMBER_DATA_ROW_LENGTH,
} from '@/shared/constants/timesheet-excel.constant';
import { XlsxHelper } from '@/shared/helpers/xlsx.helper';
import { Shift } from '@/shared/enums/shift.enum';

@Injectable()
export class TimesheetProjectService implements ITimesheetProjectService {
    constructor(private readonly timesheetProjectRepository: TimesheetProjectRepository) {}

    async _convertTimesheetProjectListToXls(worksheet: WorkSheet, filters: ExportTimesheetProjectDto): Promise<void> {
        // Findall Timesheet of this Project by Month
        const firstDay = DateTimeHelper.getFirstDayOfMonth(filters.month);
        const lastDay = DateTimeHelper.getLastDayOfMonth(filters.month);

        const timesheetProjects = await this._findAllTimesheetProject(
            {
                project: filters.projectId,
                date: {
                    $gte: firstDay,
                    $lte: lastDay,
                },
            },
            null,
            {
                populate: [
                    {
                        path: 'project',
                    },
                    {
                        path: 'members',
                        populate: 'user',
                    },
                ],
                sort: {
                    date: 1,
                    shift: -1,
                },
            },
        );

        if (timesheetProjects.length === 0) {
            throw new CustomException({
                message: TimesheetProjectError.TIMESHEET_PROJECT_NO_VALUE,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        const firstDayMoment = moment(firstDay);
        const lastDayMoment = moment(lastDay);
        const numDays: number = lastDayMoment.diff(firstDayMoment, 'days') + 1;

        // Headers
        const monthForTimesheetName = firstDayMoment.format('MM/YYYY');
        await this._createTimesheetProjectHeaders(worksheet, timesheetProjects[0].project, monthForTimesheetName);

        // Body
        // Body Headers
        this._createTimesheetBodyHeaders(worksheet, numDays);

        // Body data
        const endRow = await this._createTimesheetProjectBodyData(
            worksheet,
            timesheetProjects,
            firstDayMoment,
            numDays,
        );

        // Bottom
        await this._createTimesheetProjectBottom(worksheet, endRow + 3);

        // Border
        XlsxHelper._borderCell(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW,
            TIMESHEET_EXCEL_HOTEN_COL - 1,
            endRow - 1,
            numDays + TIMESHEET_EXCEL_COLUMNS_LENGTH_EXCEPT_MEMBER_DATA,
        );
    }

    private async _createTimesheetProjectHeaders(worksheet: WorkSheet, project: Project, month: string): Promise<void> {
        const titleStyle = {
            font: { bold: true, size: 15 },
            alignment: { wrapText: false, horizontal: 'center', vertical: 'center' },
        };

        XlsxHelper._setCell(worksheet, 1, 16, project.name, titleStyle);
        XlsxHelper._setCell(worksheet, 2, 16, project.location, {
            ...titleStyle,
            font: { ...titleStyle.font, size: 13 },
        });
        XlsxHelper._setCell(worksheet, 4, 16, TimesheetExcel.BANG_CHAM_CONG_THANG + month, titleStyle);
    }

    private _createTimesheetBodyHeaders(worksheet: WorkSheet, numDays: number): void {
        const titleStyle = {
            font: { bold: true, size: 11 },
            alignment: { wrapText: false, horizontal: 'center', vertical: 'center' },
        };

        // Table Body Headers
        XlsxHelper._setCellInRange(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW,
            TIMESHEET_EXCEL_MASO_COL,
            TIMESHEET_EXCEL_BODY_DATA_START_ROW - 1,
            TIMESHEET_EXCEL_MASO_COL,
            TimesheetExcel.MA_SO,
            titleStyle,
        );
        XlsxHelper._setCellInRange(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW,
            TIMESHEET_EXCEL_HOTEN_COL,
            TIMESHEET_EXCEL_BODY_DATA_START_ROW - 1,
            TIMESHEET_EXCEL_HOTEN_COL,
            TimesheetExcel.HO_TEN,
            titleStyle,
        );
        XlsxHelper._setCellInRange(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW,
            TIMESHEET_EXCEL_BODY_DATA_START_COL,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW,
            TIMESHEET_EXCEL_HOTEN_COL + numDays,
            TimesheetExcel.SO_NGAY_TRONG_THANG,
            titleStyle,
        );

        // Specific style for headers row
        worksheet.column(TIMESHEET_EXCEL_HOTEN_COL).setWidth(25);
        worksheet.row(TIMESHEET_EXCEL_BODY_HEADER_START_ROW).setHeight(30);

        XlsxHelper._setCellInRange(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW,
            numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW + 1,
            numDays + TIMESHEET_EXCEL_HOTEN_COL + TIMESHEET_EXCEL_COLUMNS_LENGTH_EXCEPT_MEMBER_DATA - 4,
            TimesheetExcel.NGAY_CONG,
            titleStyle,
        );
        XlsxHelper._setCell(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW + 2,
            numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL,
            TimesheetExcel.NTT,
            titleStyle,
        );
        XlsxHelper._setCell(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW + 2,
            numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 1,
            TimesheetExcel.NP,
            titleStyle,
        );
        XlsxHelper._setCell(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW + 2,
            numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 2,
            TimesheetExcel.NQD,
            titleStyle,
        );
        XlsxHelper._setCell(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW + 2,
            numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 3,
            TimesheetExcel.NCV,
            titleStyle,
        );
        XlsxHelper._setCell(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW + 2,
            numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 4,
            TimesheetExcel.NHT,
            titleStyle,
        );
        XlsxHelper._setCell(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW + 2,
            numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 5,
            TimesheetExcel.NNS,
            titleStyle,
        );
        XlsxHelper._setCell(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW + 2,
            numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 6,
            TimesheetExcel.NTC,
            titleStyle,
        );
        XlsxHelper._setCell(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW + 2,
            numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 7,
            TimesheetExcel.NHT,
            titleStyle,
        );
        XlsxHelper._setCellInRange(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW,
            numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 8,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW + 2,
            numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 8,
            TimesheetExcel.KY_NHAN,
            titleStyle,
        );
        XlsxHelper._setCellInRange(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW,
            numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 9,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW + 2,
            numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 9,
            TimesheetExcel.CHE,
            titleStyle,
        );
    }

    private async _createTimesheetProjectBodyData(
        worksheet: WorkSheet,
        timesheetProjects: TimesheetProject[],
        firstDay: moment.Moment,
        numDays: number,
    ): Promise<number> {
        const titleStyle = {
            font: { bold: true, size: 11 },
            alignment: { wrapText: false, horizontal: 'center', vertical: 'center' },
        };

        const style = {
            font: { size: 11 },
            alignment: { wrapText: true, horizontal: 'center', vertical: 'center' },
        };

        // Get all Distinc Members
        const allMembers = timesheetProjects.reduce((memberIds, timesheetProject) => {
            timesheetProject.members.forEach((member) => {
                const memberId = member._id.toString();
                if (!memberIds.has(memberId)) {
                    memberIds.set(memberId, { id: memberId, name: member.user.name });
                }
            });
            return memberIds;
        }, new Map());

        const distinctMembers = Array.from(allMembers.values());

        // // Table data
        let row: number = TIMESHEET_EXCEL_BODY_DATA_START_ROW;
        for (const distinctMember of distinctMembers) {
            // Get all timesheetProjects of this member
            const memberTimesheets = timesheetProjects.filter((timesheetProject) =>
                timesheetProject.members.some((member) => member._id.toString() === distinctMember.id),
            );

            // Process morning/evening data
            const processData = (timesheetProjects: TimesheetProject[]) => {
                return timesheetProjects.map((timesheetProject) => {
                    const date = moment(timesheetProject.date).format('DD');
                    // return { [date]: timesheetProject.isApproved ? 1 : null };
                    return { [date]: 1 };
                });
            };

            const morningTimesheets = memberTimesheets.filter(
                (timesheetProject) => timesheetProject.shift === Shift.morning,
            );
            const eveningTimesheets = memberTimesheets.filter(
                (timesheetProject) => timesheetProject.shift === Shift.evening,
            );
            const nightTimesheets = memberTimesheets.filter(
                (timesheetProject) => timesheetProject.shift === Shift.night,
            );

            const memberData = {
                name: distinctMember.name,
                morning: processData(morningTimesheets),
                evening: processData(eveningTimesheets),
                night: processData(nightTimesheets),
            };

            XlsxHelper._setCell(worksheet, row, TIMESHEET_EXCEL_HOTEN_COL, memberData.name, titleStyle);

            for (
                let col = TIMESHEET_EXCEL_BODY_DATA_START_COL;
                col < numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL;
                col++
            ) {
                if (row === TIMESHEET_EXCEL_BODY_DATA_START_ROW) {
                    XlsxHelper._setCell(
                        worksheet,
                        TIMESHEET_EXCEL_BODY_HEADER_START_ROW + 1,
                        col,
                        firstDay
                            .clone()
                            .add(col - 3, 'day')
                            .format('DD'),
                        titleStyle,
                    );

                    // Set day names
                    XlsxHelper._setCell(
                        worksheet,
                        TIMESHEET_EXCEL_BODY_HEADER_START_ROW + 2,
                        col,
                        firstDay
                            .clone()
                            .add(col - 3, 'day')
                            .format('dddd'),
                        titleStyle,
                    );
                }

                const firstSum = getExcelCellRef(row + 1, col);
                const lastSum = getExcelCellRef(row + 2, col);

                XlsxHelper._setCellFormula(
                    worksheet,
                    row,
                    col,
                    `IF(COUNTIF(${firstSum}:${lastSum},"*P*")=0,SUM(${firstSum}:${lastSum}),"P")`,
                    titleStyle,
                );
            }

            // Ntt Column
            const firstNtt = getExcelCellRef(row, TIMESHEET_EXCEL_BODY_DATA_START_COL);
            const lastNtt = getExcelCellRef(row, numDays + TIMESHEET_EXCEL_HOTEN_COL);
            const nttCellRef = getExcelCellRef(row, numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL);

            XlsxHelper._setCellFormula(
                worksheet,
                row,
                numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL,
                `SUM(${firstNtt}:${lastNtt})/2`,
                titleStyle,
            );

            // Np Column
            const npCellRef = getExcelCellRef(row, numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 1);

            XlsxHelper._setCellFormula(
                worksheet,
                row,
                numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 1,
                `COUNTIF(${firstNtt}:${lastNtt},"=P")`,
                titleStyle,
            );

            // Nqd Column
            const nqdCellRef = getExcelCellRef(row, numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 2);

            XlsxHelper._setCellFormula(
                worksheet,
                row,
                numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 2,
                `IF((${nttCellRef} + ${npCellRef}) > 26,26 - ${nttCellRef},${npCellRef})`,
                titleStyle,
            );

            // Ncv Column
            const firstNcv = getExcelCellRef(row + 5, TIMESHEET_EXCEL_BODY_DATA_START_COL);
            const lastNcv = getExcelCellRef(row + 5, numDays + TIMESHEET_EXCEL_HOTEN_COL);

            XlsxHelper._setCellFormula(
                worksheet,
                row,
                numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 3,
                `SUM(${firstNcv}:${lastNcv})/2`,
                titleStyle,
            );

            // Nht Column
            const firstNht = getExcelCellRef(row + 4, TIMESHEET_EXCEL_BODY_DATA_START_COL);
            const lastNht = getExcelCellRef(row + 4, numDays + TIMESHEET_EXCEL_HOTEN_COL);

            XlsxHelper._setCellFormula(
                worksheet,
                row,
                numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 4,
                `SUM(${firstNht}:${lastNht})/2`,
                titleStyle,
            );

            // Nns Column
            const firstNns = getExcelCellRef(row + 6, TIMESHEET_EXCEL_BODY_DATA_START_COL);
            const lastNns = getExcelCellRef(row + 6, numDays + TIMESHEET_EXCEL_HOTEN_COL);

            XlsxHelper._setCellFormula(
                worksheet,
                row,
                numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 5,
                `SUM(${firstNns}:${lastNns})/2`,
                titleStyle,
            );

            // Ntc Column
            XlsxHelper._setCellFormula(
                worksheet,
                row,
                numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 6,
                `IF((${nttCellRef} + ${npCellRef}) > 26,26 - ${nttCellRef},${npCellRef})`,
                titleStyle,
            );

            // Nht Column
            XlsxHelper._setCellFormula(
                worksheet,
                row,
                numDays + TIMESHEET_EXCEL_BODY_DATA_START_COL + 7,
                `IF(OR(${nttCellRef}<>0,${npCellRef}<>0,${nqdCellRef}<>0),1,0)`,
                titleStyle,
            );

            // Execute morning row
            XlsxHelper._setCell(worksheet, row + 1, TIMESHEET_EXCEL_HOTEN_COL, TimesheetExcel.MORNING, style);

            memberData.morning.map((data) => {
                const dateIndex = Number(Object.keys(data)[0]) + 1;
                XlsxHelper._setCell(worksheet, row + 1, dateIndex + 1, Object.values(data)[0], style);
            });

            // Execute evening row
            XlsxHelper._setCell(worksheet, row + 2, TIMESHEET_EXCEL_HOTEN_COL, TimesheetExcel.EVENING, style);

            memberData.evening.map((data) => {
                const dateIndex = Number(Object.keys(data)[0]) + 1;
                XlsxHelper._setCell(worksheet, row + 2, dateIndex + 1, Object.values(data)[0], style);
            });

            // Execute night row
            XlsxHelper._setCell(worksheet, row + 3, TIMESHEET_EXCEL_HOTEN_COL, TimesheetExcel.NIGHT, style);

            memberData.night.map((data) => {
                const dateIndex = Number(Object.keys(data)[0]) + 1;
                XlsxHelper._setCell(worksheet, row + 3, dateIndex + 1, Object.values(data)[0], style);
            });

            // Execute wait/support/productivity row
            XlsxHelper._setCell(worksheet, row + 4, TIMESHEET_EXCEL_HOTEN_COL, TimesheetExcel.SUPPORT, style);
            XlsxHelper._setCell(worksheet, row + 5, TIMESHEET_EXCEL_HOTEN_COL, TimesheetExcel.WAIT, style);
            XlsxHelper._setCell(worksheet, row + 6, TIMESHEET_EXCEL_HOTEN_COL, TimesheetExcel.PRODUCTIVITY, style);

            row = row + TIMESHEET_EXCEL_MEMBER_DATA_ROW_LENGTH;
        }

        return row;
    }

    private async _createTimesheetProjectBottom(worksheet: WorkSheet, bottomRow: number): Promise<void> {
        const formattedDate = moment(new Date()).format('[Ngày] D [tháng] M [năm] YYYY');

        const titleStyle = {
            font: { bold: true },
            alignment: { wrapText: false, horizontal: 'center', vertical: 'center' },
        };

        XlsxHelper._setCell(
            worksheet,
            bottomRow,
            TIMESHEET_EXCEL_HOTEN_COL + 7,
            TimesheetExcel.PHU_TRACH_BO_PHAN,
            titleStyle,
        );
        XlsxHelper._setCell(
            worksheet,
            bottomRow,
            TIMESHEET_EXCEL_HOTEN_COL + 21,
            TimesheetExcel.NGUOI_KIEM_TRA,
            titleStyle,
        );
        XlsxHelper._setCell(worksheet, bottomRow - 1, TIMESHEET_EXCEL_HOTEN_COL + 33, formattedDate, titleStyle);
        XlsxHelper._setCell(
            worksheet,
            bottomRow,
            TIMESHEET_EXCEL_HOTEN_COL + 33,
            TimesheetExcel.NGUOI_CHAM_CONG,
            titleStyle,
        );
    }

    // ============================ START COMMON FUNCTION ============================
    async _deleteTimesheetProject(
        filter: FilterQuery<TimesheetProject>,
        options?: any,
    ): Promise<{
        deletedCount: number;
    }> {
        return this.timesheetProjectRepository.deleteOne(filter, options);
    }

    async _findOneAndUpdateTimesheetProject(
        filter: FilterQuery<TimesheetProject>,
        update?: UpdateQuery<TimesheetProject>,
        options?: QueryOptions<TimesheetProject>,
    ): Promise<TimesheetProject> {
        return this.timesheetProjectRepository.findOneAndUpdate(filter, update, options);
    }

    async _updateOneTimesheetProject(
        filter: FilterQuery<TimesheetProject>,
        update: UpdateQuery<TimesheetProject>,
        options?: any,
    ): Promise<UpdateWriteOpResult> {
        return this.timesheetProjectRepository.updateOne(filter, update, options);
    }

    async _findByIdTimesheetProject(
        id: string,
        projection?: ProjectionType<TimesheetProject>,
        options?: QueryOptions<TimesheetProject>,
    ): Promise<TimesheetProject> {
        return this.timesheetProjectRepository.findById(id, projection, options);
    }

    async _findAllTimesheetProject(
        filter?: FilterQuery<TimesheetProject>,
        projection?: ProjectionType<TimesheetProject>,
        options?: QueryOptions<TimesheetProject>,
    ): Promise<TimesheetProject[]> {
        return this.timesheetProjectRepository.findAll(filter, projection, options);
    }

    async _createTimesheetProject(doc: TimesheetProject | any): Promise<TimesheetProject> {
        return this.timesheetProjectRepository.create(doc);
    }
    // ============================ END COMMON FUNCTION ============================
}

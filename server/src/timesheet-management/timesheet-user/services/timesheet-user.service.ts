import { XlsxHelper } from '@/shared/helpers/xlsx.helper';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ITimesheetUserService } from './timesheet-user-service.interface';
import { FilterQuery, UpdateQuery, QueryOptions, UpdateWriteOpResult, ProjectionType } from 'mongoose';
import { TimesheetUserRepository } from '../repositories/timesheet-user.repository';
import { TimesheetUser } from '../schemas/timesheet-user.schema';
import { DateTimeHelper } from '@/shared/helpers/date-time.helper';
import { ExportTimesheetUserDto } from '@/export/dtos/request/export-timesheet-user.dto';
import { Shift } from '@/shared/enums/shift.enum';
import { CustomException } from '@/shared/exceptions/custom.exception';
import {
    TIMESHEET_EXCEL_BODY_HEADER_START_ROW,
    TIMESHEET_EXCEL_HOTEN_COL,
    TIMESHEET_EXCEL_COLUMNS_LENGTH_EXCEPT_MEMBER_DATA,
    TIMESHEET_EXCEL_MASO_COL,
    TIMESHEET_EXCEL_BODY_DATA_START_ROW,
    TIMESHEET_EXCEL_BODY_DATA_START_COL,
    TIMESHEET_EXCEL_MEMBER_DATA_ROW_LENGTH,
} from '@/shared/constants/timesheet-excel.constant';
import { TimesheetExcel } from '@/shared/enums/timesheet-excel.enum';
import moment from 'moment';
import { TimesheetUserError } from '../enums/timesheet-user-error.enum';
import { WorkSheet, getExcelCellRef } from 'excel4node';

@Injectable()
export class TimesheetUserService implements ITimesheetUserService {
    constructor(private readonly timesheetUserRepository: TimesheetUserRepository) {}

    async _convertTimesheetUserListToXls(worksheet: WorkSheet, filters: ExportTimesheetUserDto): Promise<void> {
        // Findall Timesheet of this Project by Month
        const firstDay = DateTimeHelper.getFirstDayOfMonth(filters.month);
        const lastDay = DateTimeHelper.getLastDayOfMonth(filters.month);

        const timesheetUsers = await this._findAllTimesheetUser(
            {
                date: {
                    $gte: firstDay,
                    $lte: lastDay,
                },
            },
            null,
            {
                populate: {
                    path: 'members',
                    populate: 'user',
                },
                sort: {
                    date: 1,
                    shift: -1,
                },
            },
        );

        if (timesheetUsers.length === 0) {
            throw new CustomException({
                message: TimesheetUserError.TIMESHEET_USER_NO_VALUE,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        const firstDayMoment = moment(firstDay);
        const lastDayMoment = moment(lastDay);
        const numDays: number = lastDayMoment.diff(firstDayMoment, 'days') + 1;

        // Headers
        const monthForTimesheetName = firstDayMoment.format('MM/YYYY');
        await this._createTimesheetUserHeaders(worksheet, monthForTimesheetName);

        // Body
        // Body Headers
        this._createTimesheetUserBodyHeaders(worksheet, numDays);

        // Body data
        const endRow = await this._createTimesheetUserBodyData(worksheet, timesheetUsers, firstDayMoment, numDays);

        // Bottom
        await this._createTimesheetUserBottom(worksheet, endRow + 3);

        // Border
        XlsxHelper._borderCell(
            worksheet,
            TIMESHEET_EXCEL_BODY_HEADER_START_ROW,
            TIMESHEET_EXCEL_HOTEN_COL - 1,
            endRow - 1,
            numDays + TIMESHEET_EXCEL_COLUMNS_LENGTH_EXCEPT_MEMBER_DATA,
        );
    }

    private _createTimesheetUserBodyHeaders(worksheet: WorkSheet, numDays: number): void {
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

    private async _createTimesheetUserBodyData(
        worksheet: WorkSheet,
        timesheetUsers: TimesheetUser[],
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
        const allMembers = timesheetUsers.reduce((memberIds, timesheet) => {
            timesheet.members.forEach((member) => {
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
            // Get all timesheetUsers of this member
            const memberTimesheets = timesheetUsers.filter((timesheet) =>
                timesheet.members.some((member) => member._id.toString() === distinctMember.id),
            );

            // Process morning/evening data
            const processData = (timesheetUsers: TimesheetUser[]) => {
                return timesheetUsers.map((timesheet) => {
                    const date = moment(timesheet.date).format('DD');
                    // return { [date]: timesheet.isApproved ? 1 : null };
                    return { [date]: 1 };
                });
            };

            const morningTimesheets = memberTimesheets.filter((timesheet) => timesheet.shift === Shift.morning);
            const eveningTimesheets = memberTimesheets.filter((timesheet) => timesheet.shift === Shift.evening);
            const nightTimesheets = memberTimesheets.filter((timesheet) => timesheet.shift === Shift.night);

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

    private async _createTimesheetUserHeaders(worksheet: WorkSheet, month: string): Promise<void> {
        const titleStyle = {
            font: { bold: true, size: 15 },
            alignment: { wrapText: false, horizontal: 'center', vertical: 'center' },
        };

        // XlsxHelper._setCell(worksheet, 1, 16, project.name, titleStyle);
        // XlsxHelper._setCell(worksheet, 2, 16, project.location, {
        //     ...titleStyle,
        //     font: { ...titleStyle.font, size: 13 },
        // });
        XlsxHelper._setCell(worksheet, 3, 16, TimesheetExcel.BANG_CHAM_CONG_THANG + month, titleStyle);
    }

    private async _createTimesheetUserBottom(worksheet: WorkSheet, bottomRow: number): Promise<void> {
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
    async _deleteTimesheetUser(
        filter: FilterQuery<TimesheetUser>,
        options?: any,
    ): Promise<{
        deletedCount: number;
    }> {
        return this.timesheetUserRepository.deleteOne(filter, options);
    }

    async _findOneAndUpdateTimesheetUser(
        filter: FilterQuery<TimesheetUser>,
        update?: UpdateQuery<TimesheetUser>,
        options?: QueryOptions<TimesheetUser>,
    ): Promise<TimesheetUser> {
        return this.timesheetUserRepository.findOneAndUpdate(filter, update, options);
    }

    async _updateOneTimesheetUser(
        filter: FilterQuery<TimesheetUser>,
        update: UpdateQuery<TimesheetUser>,
        options?: any,
    ): Promise<UpdateWriteOpResult> {
        return this.timesheetUserRepository.updateOne(filter, update, options);
    }

    async _findOneTimesheetUser(
        filter: FilterQuery<TimesheetUser>,
        projection?: ProjectionType<TimesheetUser>,
        options?: QueryOptions<TimesheetUser>,
    ): Promise<TimesheetUser> {
        return this.timesheetUserRepository.findOne(filter, projection, options);
    }

    async _findByIdTimesheetUser(
        id: string,
        projection?: ProjectionType<TimesheetUser>,
        options?: QueryOptions<TimesheetUser>,
    ): Promise<TimesheetUser> {
        return this.timesheetUserRepository.findById(id, projection, options);
    }

    async _findAllTimesheetUser(
        filter?: FilterQuery<TimesheetUser>,
        projection?: ProjectionType<TimesheetUser>,
        options?: QueryOptions<TimesheetUser>,
    ): Promise<TimesheetUser[]> {
        return this.timesheetUserRepository.findAll(filter, projection, options);
    }

    async _createTimesheetUser(doc: TimesheetUser | any): Promise<TimesheetUser> {
        return this.timesheetUserRepository.create(doc);
    }
    // ============================ END COMMON FUNCTION ============================
}

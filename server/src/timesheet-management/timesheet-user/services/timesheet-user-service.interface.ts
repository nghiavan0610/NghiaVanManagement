import { FilterQuery, UpdateQuery, QueryOptions, UpdateWriteOpResult, ProjectionType } from 'mongoose';
import { TimesheetUser } from '../schemas/timesheet-user.schema';
import { WorkSheet } from 'excel4node';
import { ExportTimesheetUserDto } from '@/export/dtos/request/export-timesheet-user.dto';

export interface ITimesheetUserService {
    _convertTimesheetUserListToXls(worksheet: WorkSheet, filters: ExportTimesheetUserDto): Promise<void>;
    // ============================ START COMMON FUNCTION ============================
    _deleteTimesheetUser(
        filter: FilterQuery<TimesheetUser>,
        options?: any,
    ): Promise<{
        deletedCount: number;
    }>;
    _findOneAndUpdateTimesheetUser(
        filter: FilterQuery<TimesheetUser>,
        update?: UpdateQuery<TimesheetUser>,
        options?: QueryOptions<TimesheetUser>,
    ): Promise<TimesheetUser>;
    _updateOneTimesheetUser(
        filter: FilterQuery<TimesheetUser>,
        update: UpdateQuery<TimesheetUser>,
        options?: any,
    ): Promise<UpdateWriteOpResult>;
    _findOneTimesheetUser(
        filter: FilterQuery<TimesheetUser>,
        projection?: ProjectionType<TimesheetUser>,
        options?: QueryOptions<TimesheetUser>,
    ): Promise<TimesheetUser>;
    _findByIdTimesheetUser(
        id: string,
        projection?: ProjectionType<TimesheetUser>,
        options?: QueryOptions<TimesheetUser>,
    ): Promise<TimesheetUser>;
    _findAllTimesheetUser(
        filter?: FilterQuery<TimesheetUser>,
        projection?: ProjectionType<TimesheetUser>,
        options?: QueryOptions<TimesheetUser>,
    ): Promise<TimesheetUser[]>;
    _createTimesheetUser(doc: TimesheetUser | any): Promise<TimesheetUser>;
    // ============================ END COMMON FUNCTION ============================
}

export const ITimesheetUserService = Symbol('ITimesheetUserService');

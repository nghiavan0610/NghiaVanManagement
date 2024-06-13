import { FilterQuery, UpdateQuery, UpdateWriteOpResult, ProjectionType, QueryOptions } from 'mongoose';
import { TimesheetProject } from '../schemas/timesheet-project.schema';
import { ExportTimesheetProjectDto } from '@/export/dtos/request/export-timesheet-project.dto';
import { WorkSheet } from 'excel4node';

export interface ITimesheetProjectService {
    _convertTimesheetProjectListToXls(worksheet: WorkSheet, filters: ExportTimesheetProjectDto): Promise<void>;
    // ============================ START COMMON FUNCTION ============================
    _deleteTimesheetProject(
        filter: FilterQuery<TimesheetProject>,
        options?: any,
    ): Promise<{
        deletedCount: number;
    }>;
    _findOneAndUpdateTimesheetProject(
        filter: FilterQuery<TimesheetProject>,
        update?: UpdateQuery<TimesheetProject>,
        options?: QueryOptions<TimesheetProject>,
    ): Promise<TimesheetProject>;
    _updateOneTimesheetProject(
        filter: FilterQuery<TimesheetProject>,
        update: UpdateQuery<TimesheetProject>,
        options?: any,
    ): Promise<UpdateWriteOpResult>;
    _findByIdTimesheetProject(
        id: string,
        projection?: ProjectionType<TimesheetProject>,
        options?: QueryOptions<TimesheetProject>,
    ): Promise<TimesheetProject>;
    _findAllTimesheetProject(
        filter?: FilterQuery<TimesheetProject>,
        projection?: ProjectionType<TimesheetProject>,
        options?: QueryOptions<TimesheetProject>,
    ): Promise<TimesheetProject[]>;
    _createTimesheetProject(doc: TimesheetProject | any): Promise<TimesheetProject>;
    // ============================ END COMMON FUNCTION ============================
}

export const ITimesheetProjectService = Symbol('ITimesheetProjectService');

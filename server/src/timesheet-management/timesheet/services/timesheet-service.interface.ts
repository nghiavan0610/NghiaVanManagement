import { GetTimesheetProjectListByMonthDto } from '@/timesheet-management/timesheet-project/dtos/request/get-timesheet-project-list-by-month.dto';
import { TimesheetProjectDetailResponseDataDto } from '@/timesheet-management/timesheet-project/dtos/response/timesheet-project-detail-response.dto';
import { GetTimesheetUserListByMonthDto } from '@/timesheet-management/timesheet-user/dtos/request/get-timesheet-user-list-by-month.dto';
import { TimesheetUserDetailResponseDataDto } from '@/timesheet-management/timesheet-user/dtos/response/timesheet-user-detail-response.dto';

export interface ITimesheetService {
    getTimesheetUserListByMonth(filters: GetTimesheetUserListByMonthDto): Promise<TimesheetUserDetailResponseDataDto[]>;
    getTimesheetProjectListByMonth(
        filters: GetTimesheetProjectListByMonthDto,
    ): Promise<TimesheetProjectDetailResponseDataDto[]>;
}

export const ITimesheetService = Symbol('ITimesheetService');

import { Inject, Injectable } from '@nestjs/common';
import { ITimesheetService } from './timesheet-service.interface';
import { ITimesheetProjectService } from '@/timesheet-management/timesheet-project/services/timesheet-project-service.interface';
import { ITimesheetUserService } from '@/timesheet-management/timesheet-user/services/timesheet-user-service.interface';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { GetTimesheetProjectListByMonthDto } from '@/timesheet-management/timesheet-project/dtos/request/get-timesheet-project-list-by-month.dto';
import { TimesheetProjectDetailResponseDataDto } from '@/timesheet-management/timesheet-project/dtos/response/timesheet-project-detail-response.dto';
import { GetTimesheetUserListByMonthDto } from '@/timesheet-management/timesheet-user/dtos/request/get-timesheet-user-list-by-month.dto';
import { TimesheetUserDetailResponseDataDto } from '@/timesheet-management/timesheet-user/dtos/response/timesheet-user-detail-response.dto';
import { DateTimeHelper } from '@/shared/helpers/date-time.helper';

@Injectable()
export class TimesheetService implements ITimesheetService {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        @Inject(ITimesheetProjectService) private readonly timesheetProjectService: ITimesheetProjectService,
        @Inject(ITimesheetUserService) private readonly timesheetUserService: ITimesheetUserService,
    ) {}

    // [GET] /timesheets/user?month=
    async getTimesheetUserListByMonth(
        filters: GetTimesheetUserListByMonthDto,
    ): Promise<TimesheetUserDetailResponseDataDto[]> {
        this.logger.info('[GET TIMESHEET USER LIST BY MONTH], filters', filters);

        const filter: any = {};

        if (filters?.month) {
            const firstDay = DateTimeHelper.getFirstDayOfMonth(filters?.month);
            const lastDay = DateTimeHelper.getLastDayOfMonth(filters?.month);

            filter.date = {
                $gte: firstDay,
                $lte: lastDay,
            };
        }

        const timesheetUsers = await this.timesheetUserService._findAllTimesheetUser(filter, null, {
            populate: {
                path: 'members',
                populate: {
                    path: 'user',
                    populate: {
                        path: 'job',
                    },
                },
            },
            sort: {
                date: 1,
                shift: 1,
            },
        });

        return timesheetUsers;
    }

    // [GET] /timesheets/project?projectId=&month=
    async getTimesheetProjectListByMonth(
        filters: GetTimesheetProjectListByMonthDto,
    ): Promise<TimesheetProjectDetailResponseDataDto[]> {
        this.logger.info('[GET TIMESHEET PROJECT LIST BY MONTH], filters', filters);

        const filter: any = {
            project: filters.projectId,
        };

        if (filters?.month) {
            const firstDay = DateTimeHelper.getFirstDayOfMonth(filters?.month);
            const lastDay = DateTimeHelper.getLastDayOfMonth(filters?.month);

            filter.date = {
                $gte: firstDay,
                $lte: lastDay,
            };
        }

        const timesheetProjects = await this.timesheetProjectService._findAllTimesheetProject(filter, null, {
            populate: {
                path: 'members',
                populate: {
                    path: 'user',
                    populate: {
                        path: 'job',
                    },
                },
            },
            sort: {
                date: 1,
                shift: 1,
            },
        });

        return timesheetProjects;
    }
}

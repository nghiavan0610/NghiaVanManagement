import { Provider } from '@nestjs/common';
import { ITimesheetUserService } from '../services/timesheet-user-service.interface';
import { TimesheetUserService } from '../services/timesheet-user.service';

export const TimesheetUserServiceProvider: Provider = {
    provide: ITimesheetUserService,
    useClass: TimesheetUserService,
};

import { Provider } from '@nestjs/common';
import { ITimesheetService } from '../services/timesheet-service.interface';
import { TimesheetService } from '../services/timesheet.service';

export const TimesheetServiceProvider: Provider = {
    provide: ITimesheetService,
    useClass: TimesheetService,
};

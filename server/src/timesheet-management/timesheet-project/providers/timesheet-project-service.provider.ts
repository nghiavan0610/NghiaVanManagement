import { Provider } from '@nestjs/common';
import { ITimesheetProjectService } from '../services/timesheet-project-service.interface';
import { TimesheetProjectService } from '../services/timesheet-project.service';

export const TimesheetProjectServiceProvider: Provider = {
    provide: ITimesheetProjectService,
    useClass: TimesheetProjectService,
};

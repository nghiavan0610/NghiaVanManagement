import { Module } from '@nestjs/common';
import { TimesheetController } from './controllers/timesheet.controller';
import { TimesheetServiceProvider } from './providers/timesheet-project-service.provider';
import { TimesheetProjectModule } from '../timesheet-project/timesheet-project.module';
import { TimesheetUserModule } from '../timesheet-user/timesheet-user.module';

@Module({
    imports: [TimesheetProjectModule, TimesheetUserModule],
    controllers: [TimesheetController],
    providers: [TimesheetServiceProvider],
})
export class TimesheetModule {}

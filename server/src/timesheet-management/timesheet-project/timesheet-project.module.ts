import { Module } from '@nestjs/common';
import { TimesheetProjectServiceProvider } from './providers/timesheet-project-service.provider';
import { ITimesheetProjectService } from './services/timesheet-project-service.interface';
import { MongooseModule } from '@nestjs/mongoose';
import { TimesheetProject, TimesheetProjectSchema } from './schemas/timesheet-project.schema';
import { TimesheetProjectRepository } from './repositories/timesheet-project.repository';

@Module({
    imports: [MongooseModule.forFeature([{ name: TimesheetProject.name, schema: TimesheetProjectSchema }])],
    providers: [TimesheetProjectServiceProvider, TimesheetProjectRepository],
    exports: [ITimesheetProjectService],
})
export class TimesheetProjectModule {}

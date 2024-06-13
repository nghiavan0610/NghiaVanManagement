import { Module } from '@nestjs/common';
import { TimesheetUserServiceProvider } from './providers/timesheet-user-service.provider';
import { ITimesheetUserService } from './services/timesheet-user-service.interface';
import { MongooseModule } from '@nestjs/mongoose';
import { TimesheetUser, TimesheetUserSchema } from './schemas/timesheet-user.schema';
import { TimesheetUserRepository } from './repositories/timesheet-user.repository';

@Module({
    imports: [MongooseModule.forFeature([{ name: TimesheetUser.name, schema: TimesheetUserSchema }])],
    providers: [TimesheetUserServiceProvider, TimesheetUserRepository],
    exports: [ITimesheetUserService],
})
export class TimesheetUserModule {}

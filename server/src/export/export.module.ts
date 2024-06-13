import { Module } from '@nestjs/common';
import { ExportServiceProvider } from './providers/export-service.provider';
import { IExportService } from './services/export-service.interface';
import { ExportController } from './controllers/export.controller';
import { SummaryModule } from '@/summary/summary.module';
import { ReportModule } from '@/report/report.module';
import { TimesheetProjectModule } from '@/timesheet-management/timesheet-project/timesheet-project.module';
import { TimesheetUserModule } from '@/timesheet-management/timesheet-user/timesheet-user.module';

@Module({
    imports: [SummaryModule, ReportModule, TimesheetProjectModule, TimesheetUserModule],
    controllers: [ExportController],
    providers: [ExportServiceProvider],
    exports: [IExportService],
})
export class ExportModule {}

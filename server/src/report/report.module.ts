import { Module } from '@nestjs/common';
import { ReportServiceProvider } from './providers/report-service.provider';
import { IReportService } from './services/report-service.interface';
import { ProjectModule } from '@/project-management/project/project.module';

@Module({
    imports: [ProjectModule],
    providers: [ReportServiceProvider],
    exports: [IReportService],
})
export class ReportModule {}

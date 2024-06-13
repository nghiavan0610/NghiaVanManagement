import { Provider } from '@nestjs/common';
import { IReportService } from '../services/report-service.interface';
import { ReportService } from '../services/report.service';

export const ReportServiceProvider: Provider = {
    provide: IReportService,
    useClass: ReportService,
};

import { ExportReportDto } from '@/export/dtos/request/export-report.dto';
import { ReportDataDto } from '../dtos/request/report-data.dto';

export interface IReportService {
    _createReportData(filters: ExportReportDto): Promise<ReportDataDto>;
}

export const IReportService = Symbol('IReportService');

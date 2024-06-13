import { ExportReportDto } from '../dtos/request/export-report.dto';
import { ExportSummaryDto } from '../dtos/request/export-summary.dto';
import { ExportTimesheetProjectDto } from '../dtos/request/export-timesheet-project.dto';
import { ExportTimesheetUserDto } from '../dtos/request/export-timesheet-user.dto';

export interface IExportService {
    exportReport(filters: ExportReportDto): Promise<{ fileName: string; buffer: Buffer }>;
    exportSummary(filters: ExportSummaryDto): Promise<{ fileName: string; buffer: Buffer }>;
    exportTimesheetProject(filters: ExportTimesheetProjectDto): Promise<{ fileName: string; buffer: Buffer }>;
    exportTimesheetUSer(filters: ExportTimesheetUserDto): Promise<{ fileName: string; buffer: Buffer }>;
    // ============================ START COMMON FUNCTION ============================
    // ============================ END COMMON FUNCTION ============================
}

export const IExportService = Symbol('IExportService');

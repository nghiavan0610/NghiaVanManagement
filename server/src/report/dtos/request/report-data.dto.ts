import { Project } from '@/project-management/project/schemas/project.schema';

export class ReportDataDto {
    date: string;
    startedAt: string;
    project: Project;
    // export: ExportNewReportDataDto | ExporRecalledtReportDataDto;
    export: any;
}

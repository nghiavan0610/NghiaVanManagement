import { ExportError } from '@/export/enums/export-error.enum';
import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { ReportRouteDataDto } from '@/report/dtos/request/report-route.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ExportReportDto {
    @ApiProperty()
    @IsNotEmpty({ message: ExportError.REPORT_NAME_EMPTY })
    templateName: string;

    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_ID_EMPTY })
    projectId: string;

    routes: ReportRouteDataDto[];
}

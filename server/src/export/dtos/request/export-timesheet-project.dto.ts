import { ExportError } from '@/export/enums/export-error.enum';
import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ExportTimesheetProjectDto {
    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_ID_EMPTY })
    projectId: string;

    @ApiProperty()
    @IsNotEmpty({ message: ExportError.TIMESHEET_MONTH_EMPTY })
    month: string;
}

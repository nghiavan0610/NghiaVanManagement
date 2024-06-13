import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetTimesheetProjectListByMonthDto {
    @ApiPropertyOptional()
    @IsNotEmpty({ message: ProjectError.PROJECT_ID_EMPTY })
    projectId: string;

    @ApiPropertyOptional()
    @IsOptional()
    // @IsNotEmpty({ message: TimesheetError.TIMESHEET_MONTH_EMPTY })
    month: string;
}

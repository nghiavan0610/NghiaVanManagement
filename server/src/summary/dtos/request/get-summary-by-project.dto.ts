import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetSummaryByProjectDto {
    @ApiPropertyOptional()
    @IsNotEmpty({ message: ProjectError.PROJECT_ID_EMPTY })
    projectId: string;
}

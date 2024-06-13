import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetBoardListByProjectDto {
    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_ID_EMPTY })
    projectId: string;

    @ApiPropertyOptional()
    @IsOptional()
    month?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ProjectError } from '../../enums/project-error.enum';
import { IsNotEmpty, IsOptional, IsDate } from 'class-validator';
import { UniqueProjectName } from '@/project-management/project/validators/project-name.validator';
import { UniqueProjectCode } from '@/project-management/project/validators/project-code.validator';

export class CreateProjectDto {
    userId: string;

    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_NAME_EMPTY })
    @UniqueProjectName({ message: ProjectError.PROJECT_NAME_EXISTED })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_CODE_EMPTY })
    @UniqueProjectCode({ message: ProjectError.PROJECT_CODE_EXISTED })
    code: string;

    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_LOCATION_EMPTY })
    location: string;

    @ApiProperty()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => value && new Date(value))
    @IsDate({ message: ProjectError.PROJECT_STARTED_AT_INVALID })
    startedAt?: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ProjectError } from '../../enums/project-error.enum';
import { IsNotEmpty, IsOptional, IsDate, IsBoolean } from 'class-validator';

export class UpdateProjectDto {
    userId: string;

    id: string;

    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_NAME_EMPTY })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_CODE_EMPTY })
    code: string;

    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_LOCATION_EMPTY })
    location: string;

    @ApiProperty()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @Transform(({ value }) => value && new Date(value))
    @IsDate({ message: ProjectError.PROJECT_STARTED_AT_INVALID })
    startedAt: Date;

    @ApiProperty()
    @IsBoolean()
    isDone: boolean;
}

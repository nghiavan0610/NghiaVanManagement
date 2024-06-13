import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class ImportSummaryDto {
    userId: string;

    file: Express.Multer.File;

    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_ID_EMPTY })
    projectId: string;

    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_IS_ORIGINAL_INVALID })
    @Transform(({ value }) => value.toLowerCase() === 'true')
    isOriginal: boolean;
}

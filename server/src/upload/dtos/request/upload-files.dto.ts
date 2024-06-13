import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { FileType } from '@/upload/enums/file-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UploadFilesDto {
    files: Array<Express.Multer.File>;

    @ApiProperty({ type: String })
    @IsNotEmpty({ message: ProjectError.PROJECT_ID_EMPTY })
    projectId: string;

    @ApiProperty()
    @IsEnum(FileType)
    type: FileType;
}

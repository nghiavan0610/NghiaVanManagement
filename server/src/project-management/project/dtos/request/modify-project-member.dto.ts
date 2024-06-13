import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class ModifyProjectMemberDto {
    userId: string;

    id: string;

    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_MANAGER_EMPTY })
    manager: string;

    @ApiProperty()
    @IsArray()
    members: string[] | [];
}

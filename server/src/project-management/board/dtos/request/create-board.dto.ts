import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { Shift } from '@/shared/enums/shift.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { BoardError } from '../../enums/board-error.enum';

export class CreateBoardDto {
    userId: string;

    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_ID_EMPTY })
    projectId: string;

    @ApiProperty()
    @IsNotEmpty({ message: BoardError.BOARD_DATE_EMPTY })
    date: Date;

    @ApiProperty()
    @IsEnum(Shift)
    shift: Shift;

    @ApiProperty()
    @IsArray()
    proofs: string[] | [];
}

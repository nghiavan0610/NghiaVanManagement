import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty } from 'class-validator';

export enum LeaveShiftDto {
    morning = 1,
    evening = 2,
    night = 3,
    full = 4,
}
export class RequestLeaveDto {
    userId: string;

    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_ID_EMPTY })
    projectId: string;

    @ApiProperty()
    @IsArray()
    @ArrayMinSize(1)
    dates: Date[];

    @ApiProperty()
    @IsEnum(LeaveShiftDto)
    shift: LeaveShiftDto;
}

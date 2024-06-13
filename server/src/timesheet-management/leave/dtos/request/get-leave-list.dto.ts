import { LeaveError } from '@/timesheet-management/leave/enums/leave-error.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetLeaveListDto {
    userId: string;

    @ApiProperty()
    @IsNotEmpty({ message: LeaveError.LEAVE_MONTH_EMPTY })
    month: string;
}

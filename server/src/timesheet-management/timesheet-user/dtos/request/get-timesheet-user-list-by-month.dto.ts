import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetTimesheetUserListByMonthDto {
    @ApiPropertyOptional()
    @IsOptional()
    // @IsNotEmpty({ message: TimesheetError.TIMESHEET_MONTH_EMPTY })
    month: string;
}

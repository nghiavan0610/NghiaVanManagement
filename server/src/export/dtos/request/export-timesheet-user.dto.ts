import { ExportError } from '@/export/enums/export-error.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ExportTimesheetUserDto {
    @ApiProperty()
    @IsNotEmpty({ message: ExportError.TIMESHEET_MONTH_EMPTY })
    month: string;
}

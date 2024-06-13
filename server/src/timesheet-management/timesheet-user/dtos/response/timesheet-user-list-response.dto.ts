import { IResponse } from '@/shared/interfaces/response.interface';
import { Expose, Type } from 'class-transformer';
import { TimesheetUserDetailResponseDataDto } from './timesheet-user-detail-response.dto';

@Expose()
export class TimesheetUserListResponseDto implements IResponse<TimesheetUserDetailResponseDataDto[]> {
    success = true;

    @Type(() => TimesheetUserDetailResponseDataDto)
    data: TimesheetUserDetailResponseDataDto[];

    constructor(partial: TimesheetUserDetailResponseDataDto[]) {
        this.data = partial;
        // this.data = new TimesheetUserDetailResponseDataDto(partial);
    }
}

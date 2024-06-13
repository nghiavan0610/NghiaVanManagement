import { IResponse } from '@/shared/interfaces/response.interface';
import { Expose, Type } from 'class-transformer';
import { TimesheetProjectDetailResponseDataDto } from './timesheet-project-detail-response.dto';

@Expose()
export class TimesheetProjectListResponseDto implements IResponse<TimesheetProjectDetailResponseDataDto[]> {
    success = true;

    @Type(() => TimesheetProjectDetailResponseDataDto)
    data: TimesheetProjectDetailResponseDataDto[];

    constructor(partial: TimesheetProjectDetailResponseDataDto[]) {
        this.data = partial;
        // this.data = new TimesheetProjectDetailResponseDataDto(partial);
    }
}

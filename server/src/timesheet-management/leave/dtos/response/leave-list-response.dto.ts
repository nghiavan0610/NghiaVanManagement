import { IResponse } from '@/shared/interfaces/response.interface';
import { Expose, Type } from 'class-transformer';
import { LeaveDetailResponseDataDto } from './leave-detail-response.dto';

@Expose()
export class LeaveListResponseDto implements IResponse<LeaveDetailResponseDataDto[]> {
    success = true;

    @Type(() => LeaveDetailResponseDataDto)
    data: LeaveDetailResponseDataDto[];

    constructor(partial: LeaveDetailResponseDataDto[]) {
        this.data = partial;
        // this.data = new LeaveDetailResponseDataDto(partial);
    }
}

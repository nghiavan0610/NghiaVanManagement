import { IResponse } from '@/shared/interfaces/response.interface';
import { Expose, Type } from 'class-transformer';
import { MemberDetailResponseDataDto } from './member-detail-response.dto';

@Expose()
export class MemberListResponseDto implements IResponse<MemberDetailResponseDataDto[]> {
    success = true;

    @Type(() => MemberDetailResponseDataDto)
    data: MemberDetailResponseDataDto[];

    constructor(partial: MemberDetailResponseDataDto[]) {
        this.data = partial;
        // this.data = new MemberDetailResponseDataDto(partial);
    }
}

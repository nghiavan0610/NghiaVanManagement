import { IResponse } from '@/shared/interfaces/response.interface';
import { Expose, Type } from 'class-transformer';
import { UserInfoResponseDataDto } from './user-info-response.dto';

@Expose()
export class UpdateInfoResponseDto implements IResponse<UserInfoResponseDataDto> {
    success = true;

    @Type(() => UserInfoResponseDataDto)
    data: UserInfoResponseDataDto;

    constructor(partial: UserInfoResponseDataDto) {
        this.data = partial;
        // this.data = new UserInfoResponseDataDto(partial);
    }
}

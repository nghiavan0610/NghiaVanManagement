import { IResponse } from '@/shared/interfaces/response.interface';
import { UserInfoResponseDataDto } from '@/user/dtos/response/user-info-response.dto';
import { Expose, Type } from 'class-transformer';

@Expose()
export class CreateUserResponseDto implements IResponse<UserInfoResponseDataDto> {
    success = true;

    @Type(() => UserInfoResponseDataDto)
    data: UserInfoResponseDataDto;

    constructor(partial: UserInfoResponseDataDto) {
        this.data = partial;
        // this.data = new UserInfoResponseDataDto(partial);
    }
}

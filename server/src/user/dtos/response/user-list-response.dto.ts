import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserInfoResponseDataDto } from './user-info-response.dto';

@Expose()
export class UserListResponseDto implements IResponse<UserInfoResponseDataDto[]> {
    success = true;

    @ApiProperty({ isArray: true, type: UserInfoResponseDataDto })
    @Type(() => UserInfoResponseDataDto)
    data: UserInfoResponseDataDto[];

    constructor(partial: UserInfoResponseDataDto[]) {
        this.data = partial;
        // this.data = new UserInfoResponseDataDto(partial);
    }
}

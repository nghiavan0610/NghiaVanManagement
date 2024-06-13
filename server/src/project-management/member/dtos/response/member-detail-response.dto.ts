import { IResponse } from '@/shared/interfaces/response.interface';
import { UserInfoResponseDataDto } from '@/user/dtos/response/user-info-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';

export class MemberDetailResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    @Type(() => UserInfoResponseDataDto)
    user: UserInfoResponseDataDto;

    @ApiProperty()
    @Expose()
    role: string;

    constructor(partial: Partial<MemberDetailResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class MemberDetailResponseDto implements IResponse<MemberDetailResponseDataDto> {
    success = true;

    @Type(() => MemberDetailResponseDataDto)
    data: MemberDetailResponseDataDto;

    constructor(partial: MemberDetailResponseDataDto) {
        this.data = partial;
        // this.data = new MemberDetailResponseDataDto(partial);
    }
}

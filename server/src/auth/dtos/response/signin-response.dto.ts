import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class SigninResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    username: string;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    role: string;

    @ApiProperty()
    @Expose()
    @IsOptional()
    slug?: string;

    @ApiProperty()
    @Expose()
    accessToken?: string;

    @ApiProperty()
    @Expose()
    refreshToken?: string;

    constructor(partial: Partial<SigninResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class SigninResponseDto implements IResponse<SigninResponseDataDto> {
    success = true;

    @Type(() => SigninResponseDataDto)
    data: SigninResponseDataDto;

    constructor(partial: SigninResponseDataDto) {
        this.data = partial;
        // this.data = new SigninResponseDataDto(partial);
    }
}

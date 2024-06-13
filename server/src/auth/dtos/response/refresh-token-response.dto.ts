import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class RefreshTokenResponseDataDto {
    @ApiProperty()
    @Expose()
    accessToken: string;

    @ApiProperty()
    @Expose()
    refreshToken: string;

    constructor(partial: Partial<RefreshTokenResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class RefreshTokenResponseDto implements IResponse<RefreshTokenResponseDataDto> {
    @ApiProperty({ type: Boolean })
    success = true;

    @ApiProperty({ type: RefreshTokenResponseDataDto })
    @Type(() => RefreshTokenResponseDataDto)
    data: RefreshTokenResponseDataDto;

    constructor(partial: RefreshTokenResponseDataDto) {
        this.data = new RefreshTokenResponseDataDto(partial);
    }
}

import { IResponse } from '@/shared/interfaces/response.interface';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordResponseDataDto {
    @ApiProperty()
    @Expose()
    accessToken: string;

    @ApiProperty()
    @Expose()
    refreshToken: string;

    constructor(partial: Partial<ChangePasswordResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class ChangePasswordResponseDto implements IResponse<ChangePasswordResponseDataDto> {
    success = true;

    @Type(() => ChangePasswordResponseDataDto)
    data: ChangePasswordResponseDataDto;

    constructor(partial: ChangePasswordResponseDataDto) {
        this.data = partial;
        // this.data = new ChangePasswordResponseDataDto(partial);
    }
}

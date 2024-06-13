import { Shift } from '@/shared/enums/shift.enum';
import { IResponse } from '@/shared/interfaces/response.interface';
import { UserInfoResponseDataDto } from '@/user/dtos/response/user-info-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';

export class LeaveDetailResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    // @ApiProperty()
    // @Expose()
    // @Type(() => ProjectDetailResponseDataDto)
    // project: ProjectDetailResponseDataDto;

    @ApiProperty()
    @Expose()
    date: Date;

    @ApiProperty()
    @Expose()
    shift: Shift;

    @ApiProperty()
    @Expose()
    @Type(() => UserInfoResponseDataDto)
    users: UserInfoResponseDataDto[];

    constructor(partial: Partial<LeaveDetailResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class LeaveDetailResponseDto implements IResponse<LeaveDetailResponseDataDto> {
    success = true;

    @Type(() => LeaveDetailResponseDataDto)
    data: LeaveDetailResponseDataDto;

    constructor(partial: LeaveDetailResponseDataDto) {
        this.data = partial;
        // this.data = new LeaveDetailResponseDataDto(partial);
    }
}

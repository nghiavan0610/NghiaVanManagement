import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';
import { MemberDetailResponseDataDto } from '@/project-management/member/dtos/response/member-detail-response.dto';
import { Shift } from '@/shared/enums/shift.enum';

export class TimesheetUserDetailResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    date: Date;

    @ApiProperty()
    @Expose()
    shift: Shift;

    @ApiProperty()
    @Expose()
    @Type(() => MemberDetailResponseDataDto)
    members: MemberDetailResponseDataDto[];

    constructor(partial: Partial<TimesheetUserDetailResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class TimesheetUserDetailResponseDto implements IResponse<TimesheetUserDetailResponseDataDto> {
    success = true;

    @Type(() => TimesheetUserDetailResponseDataDto)
    data: TimesheetUserDetailResponseDataDto;

    constructor(partial: TimesheetUserDetailResponseDataDto) {
        this.data = partial;
        // this.data = new TimesheetUserDetailResponseDataDto(partial);
    }
}

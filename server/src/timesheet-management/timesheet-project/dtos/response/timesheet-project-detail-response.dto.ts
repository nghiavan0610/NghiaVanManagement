import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';
import { ProjectDetailResponseDataDto } from '@/project-management/project/dtos/response/project-detail-response.dto';
import { MemberDetailResponseDataDto } from '@/project-management/member/dtos/response/member-detail-response.dto';
import { Shift } from '@/shared/enums/shift.enum';

export class TimesheetProjectDetailResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    @Type(() => ProjectDetailResponseDataDto)
    project: ProjectDetailResponseDataDto;

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

    constructor(partial: Partial<TimesheetProjectDetailResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class TimesheetProjectDetailResponseDto implements IResponse<TimesheetProjectDetailResponseDataDto> {
    success = true;

    @Type(() => TimesheetProjectDetailResponseDataDto)
    data: TimesheetProjectDetailResponseDataDto;

    constructor(partial: TimesheetProjectDetailResponseDataDto) {
        this.data = partial;
        // this.data = new TimesheetProjectDetailResponseDataDto(partial);
    }
}

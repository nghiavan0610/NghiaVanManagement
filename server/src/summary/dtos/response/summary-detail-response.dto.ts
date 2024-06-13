import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';
import { RouteResponseDataDto } from './route-response.dto';
import { ProjectDetailResponseDataDto } from '@/project-management/project/dtos/response/project-detail-response.dto';

export class SummaryDetailResponseDataDto {
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
    @Type(() => Boolean)
    isOriginal: boolean;

    @ApiProperty()
    @Expose()
    @Type(() => RouteResponseDataDto)
    routes: RouteResponseDataDto[];

    constructor(partial: Partial<SummaryDetailResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class SummaryDetailResponseDto implements IResponse<SummaryDetailResponseDataDto[]> {
    success = true;

    @Type(() => SummaryDetailResponseDataDto)
    data: SummaryDetailResponseDataDto[];

    constructor(partial: SummaryDetailResponseDataDto[]) {
        this.data = partial;
        // this.data = new SummaryDetailResponseDataDto(partial);
    }
}

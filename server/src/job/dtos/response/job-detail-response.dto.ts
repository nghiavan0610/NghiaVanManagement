import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class JobDetailResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @Expose()
    @IsOptional()
    slug?: string;

    constructor(partial: Partial<JobDetailResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class JobDetailResponseDto implements IResponse<JobDetailResponseDataDto> {
    success = true;

    @Type(() => JobDetailResponseDataDto)
    data: JobDetailResponseDataDto;

    constructor(partial: JobDetailResponseDataDto) {
        this.data = partial;
        // this.data = new JobDetailResponseDataDto(partial);
    }
}

import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';

export class CreateProjectResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    code: string;

    @ApiProperty()
    @Expose()
    location: string;

    @ApiProperty()
    @Expose()
    description: string;

    @ApiProperty()
    @Expose()
    startedAt: Date;

    @ApiProperty()
    @Expose()
    isDone: boolean;

    @ApiProperty()
    @Expose()
    slug: string;

    constructor(partial: Partial<CreateProjectResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class CreateProjectResponseDto implements IResponse<CreateProjectResponseDataDto> {
    success = true;

    @Type(() => CreateProjectResponseDataDto)
    data: CreateProjectResponseDataDto;

    constructor(partial: CreateProjectResponseDataDto) {
        this.data = partial;
        // this.data = new CreateProjectResponseDataDto(partial);
    }
}

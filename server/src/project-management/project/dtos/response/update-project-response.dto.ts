import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';

export class UpdateProjectResponseDataDto {
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

    constructor(partial: Partial<UpdateProjectResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class UpdateProjectResponseDto implements IResponse<UpdateProjectResponseDataDto> {
    success = true;

    @Type(() => UpdateProjectResponseDataDto)
    data: UpdateProjectResponseDataDto;

    constructor(partial: UpdateProjectResponseDataDto) {
        this.data = partial;
        // this.data = new UpdateProjectResponseDataDto(partial);
    }
}

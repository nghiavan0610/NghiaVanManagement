import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';

export class CategoryDetailResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    slug: string;

    constructor(partial: Partial<CategoryDetailResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class CategoryDetailResponseDto implements IResponse<CategoryDetailResponseDataDto> {
    success = true;

    @Type(() => CategoryDetailResponseDataDto)
    data: CategoryDetailResponseDataDto;

    constructor(partial: CategoryDetailResponseDataDto) {
        this.data = partial;
        // this.data = new CategoryDetailResponseDataDto(partial);
    }
}

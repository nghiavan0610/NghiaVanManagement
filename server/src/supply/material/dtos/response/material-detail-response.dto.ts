import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';
import { CategoryDetailResponseDataDto } from '@/supply/category/dtos/response/category-detail-response.dto';

export class MaterialDetailResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    @Type(() => CategoryDetailResponseDataDto)
    category: CategoryDetailResponseDataDto;

    @ApiProperty()
    @Expose()
    slug: string;

    constructor(partial: Partial<MaterialDetailResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class MaterialDetailResponseDto implements IResponse<MaterialDetailResponseDataDto> {
    success = true;

    @Type(() => MaterialDetailResponseDataDto)
    data: MaterialDetailResponseDataDto;

    constructor(partial: MaterialDetailResponseDataDto) {
        this.data = partial;
        // this.data = new MaterialDetailResponseDataDto(partial);
    }
}

import { CategoryDetailResponseDataDto } from '@/supply/category/dtos/response/category-detail-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';
import { PillarMaterialResponseDataDto } from './pillar-material-response.dto';

export class PillarCategoryResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    @Type(() => CategoryDetailResponseDataDto)
    category: CategoryDetailResponseDataDto;

    @ApiProperty()
    @Expose()
    position: number;

    @ApiProperty()
    @Expose()
    @Type(() => PillarMaterialResponseDataDto)
    materials: PillarMaterialResponseDataDto[];

    constructor(partial: Partial<PillarCategoryResponseDataDto>) {
        Object.assign(this, partial);
    }
}

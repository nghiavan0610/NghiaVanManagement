import { PillarGroupType } from '@/summary/schemas/pillar-group.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import mongoose from 'mongoose';
import { PillarCategoryResponseDataDto } from './pillar-category-response.dto';

export class PillarGroupResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @IsEnum(PillarGroupType)
    @Expose()
    type: PillarGroupType;

    @ApiProperty()
    @Expose()
    position: number;

    @ApiProperty()
    @Expose()
    @Type(() => PillarCategoryResponseDataDto)
    categories: PillarCategoryResponseDataDto[];

    constructor(partial: Partial<PillarGroupResponseDataDto>) {
        Object.assign(this, partial);
    }
}

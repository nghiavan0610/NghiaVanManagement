import { MaterialDetailResponseDataDto } from '@/supply/material/dtos/response/material-detail-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class PillarMaterialResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    @Type(() => MaterialDetailResponseDataDto)
    material: MaterialDetailResponseDataDto;

    @ApiProperty()
    @IsOptional()
    @Expose()
    quantity: number;

    @ApiProperty()
    @IsOptional()
    @Expose()
    comment?: string;

    @ApiProperty()
    @Expose()
    isDone: boolean;

    @ApiProperty()
    @Expose()
    position: number;

    constructor(partial: Partial<PillarMaterialResponseDataDto>) {
        Object.assign(this, partial);
    }
}

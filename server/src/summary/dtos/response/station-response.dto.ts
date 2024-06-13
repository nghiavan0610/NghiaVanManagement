import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';
import { PillarResponseDataDto } from './pillar-response.dto';

export class StationResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    position: number;

    @ApiProperty()
    @Expose()
    @Type(() => PillarResponseDataDto)
    pillars: PillarResponseDataDto[];

    constructor(partial: Partial<StationResponseDataDto>) {
        Object.assign(this, partial);
    }
}

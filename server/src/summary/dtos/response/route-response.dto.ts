import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import mongoose from 'mongoose';
import { StationResponseDataDto } from './station-response.dto';

export class RouteResponseDataDto {
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
    @Type(() => StationResponseDataDto)
    stations: StationResponseDataDto[];

    constructor(partial: Partial<RouteResponseDataDto>) {
        Object.assign(this, partial);
    }
}

import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import mongoose from 'mongoose';
import { PillarGroupResponseDataDto } from './pillar-group-response.dto';

export class PillarResponseDataDto {
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
    @IsOptional()
    @Expose()
    distance?: number;

    @ApiProperty()
    @IsOptional()
    @Expose()
    incrementDistance?: number;

    @ApiProperty()
    @IsOptional()
    @Expose()
    completion?: string;

    @ApiProperty()
    @IsOptional()
    @Expose()
    completionDistance?: number;

    @ApiProperty()
    @IsOptional()
    @Expose()
    neoDistance?: number;

    @ApiProperty()
    @IsOptional()
    @Expose()
    shape?: string;

    @ApiProperty()
    @IsOptional()
    @Expose()
    middleLine?: number;

    @ApiProperty()
    @IsOptional()
    @Expose()
    lowLine?: number;

    @ApiProperty()
    @IsOptional()
    @Expose()
    description?: string;

    @ApiProperty()
    @Expose()
    @Type(() => PillarGroupResponseDataDto)
    groups: PillarGroupResponseDataDto[];

    constructor(partial: Partial<PillarResponseDataDto>) {
        Object.assign(this, partial);
    }
}

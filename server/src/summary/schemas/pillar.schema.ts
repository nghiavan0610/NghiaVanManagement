import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Type } from 'class-transformer';
import { PillarGroup } from './pillar-group.schema';

export type PillarDocument = HydratedDocument<Pillar>;

@Schema()
export class Pillar {
    _id: mongoose.Types.ObjectId;

    @Prop({ type: String })
    name: string;

    @Prop({ type: Number })
    position: number;

    @Prop({ type: Number, float: true })
    distance: number;

    @Prop({ type: Number, float: true })
    incrementDistance: number;

    @Prop({ type: String })
    completion: string;

    @Prop({ type: Number, float: true })
    completionDistance: number;

    @Prop({ type: Number, float: true })
    neoDistance: number;

    @Prop({ type: String })
    shape: string;

    @Prop({ type: Number, float: true })
    middleLine: number;

    @Prop({ type: Number, float: true })
    lowLine: number;

    @Prop({ type: String })
    description: string;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'PillarGroup',
    })
    @Type(() => PillarGroup)
    groups: PillarGroup[];
}

export const PillarSchema = SchemaFactory.createForClass(Pillar);

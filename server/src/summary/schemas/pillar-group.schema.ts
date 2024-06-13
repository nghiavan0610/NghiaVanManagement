import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Type } from 'class-transformer';
import { PillarCategory } from './pillar-category.schema';

export type PillarGroupDocument = HydratedDocument<PillarGroup>;

export enum PillarGroupType {
    new = 'new',
    reassembled = 'reassembled',
    recalled = 'recalled',
}

@Schema()
export class PillarGroup {
    _id: mongoose.Types.ObjectId;

    @Prop({ type: String })
    name: string;

    @Prop({
        type: String,
        enum: PillarGroupType,
        required: true,
    })
    type: PillarGroupType;

    @Prop({ type: Number })
    position: number;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'PillarCategory',
    })
    @Type(() => PillarCategory)
    categories: PillarCategory[];
}

export const PillarGroupSchema = SchemaFactory.createForClass(PillarGroup);

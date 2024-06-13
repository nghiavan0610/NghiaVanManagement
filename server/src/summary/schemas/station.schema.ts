import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Type } from 'class-transformer';
import { Pillar } from './pillar.schema';

export type StationDocument = HydratedDocument<Station>;

@Schema()
export class Station {
    _id: mongoose.Types.ObjectId;

    @Prop({ type: String })
    name: string;

    @Prop({ type: Number })
    position: number;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Pillar',
    })
    @Type(() => Pillar)
    pillars: Pillar[];
}

export const StationSchema = SchemaFactory.createForClass(Station);

import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Type } from 'class-transformer';
import { Station } from './station.schema';

export type RouteDocument = HydratedDocument<Route>;

@Schema()
export class Route {
    _id: mongoose.Types.ObjectId;

    @Prop({ type: String })
    name: string;

    @Prop({ type: Number })
    position: number;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Station',
    })
    @Type(() => Station)
    stations: Station[];
}

export const RouteSchema = SchemaFactory.createForClass(Route);

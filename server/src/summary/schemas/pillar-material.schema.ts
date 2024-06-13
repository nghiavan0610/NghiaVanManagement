import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Type } from 'class-transformer';
import { Material } from '@/supply/material/schemas/material.schema';

export type PillarMaterialDocument = HydratedDocument<PillarMaterial>;

@Schema()
export class PillarMaterial {
    _id: mongoose.Types.ObjectId;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
    })
    @Type(() => Material)
    material: Material;

    @Prop({ type: Number })
    quantity: number;

    @Prop({ type: String })
    comment: string;

    @Prop({ type: Boolean, default: false })
    isDone: boolean;

    @Prop({ type: Number })
    position: number;
}

export const PillarMaterialSchema = SchemaFactory.createForClass(PillarMaterial);

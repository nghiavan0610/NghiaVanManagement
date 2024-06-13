import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Type } from 'class-transformer';
import { Category } from '@/supply/category/schemas/category.schema';
import { PillarMaterial } from './pillar-material.schema';

export type PillarCategoryDocument = HydratedDocument<PillarCategory>;

@Schema()
export class PillarCategory {
    _id: mongoose.Types.ObjectId;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    })
    @Type(() => Category)
    category: Category;

    @Prop({ type: Number })
    position: number;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'PillarMaterial',
    })
    @Type(() => PillarMaterial)
    materials: PillarMaterial[];
}

export const PillarCategorySchema = SchemaFactory.createForClass(PillarCategory);

import { StringHelper } from '@/shared/helpers/string.helper';
import { Category } from '@/supply/category/schemas/category.schema';
import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose, { HydratedDocument } from 'mongoose';

export type MaterialDocument = HydratedDocument<Material>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
})
export class Material {
    _id: mongoose.Types.ObjectId;

    @Prop({ type: String })
    name: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        index: true,
    })
    @Type(() => Category)
    category: Category;

    @Prop({ type: String })
    slug: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

MaterialSchema.pre('save', function (next) {
    this.slug = StringHelper.textToSlug(this.name);
    next();
});

MaterialSchema.pre('updateOne', function (next) {
    const data = this.getUpdate();
    const slug = StringHelper.textToSlug(data['name']);

    this.set({ slug: slug });

    next();
});

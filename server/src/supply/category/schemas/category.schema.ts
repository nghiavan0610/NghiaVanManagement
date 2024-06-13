import { StringHelper } from '@/shared/helpers/string.helper';
import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
})
export class Category {
    _id: mongoose.Types.ObjectId;

    @Prop({ type: String })
    name: string;

    @Prop({ type: String })
    slug: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ name: 1, type: 1 }, { unique: true });

CategorySchema.pre('save', function (next) {
    this.slug = StringHelper.textToSlug(this.name);
    next();
});

CategorySchema.pre('updateOne', function (next) {
    const data = this.getUpdate();
    const slug = StringHelper.textToSlug(data['name']);

    this.set({ slug: slug });

    next();
});

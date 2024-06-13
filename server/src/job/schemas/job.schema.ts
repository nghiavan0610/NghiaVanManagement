import { StringHelper } from '@/shared/helpers/string.helper';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type JobDocument = HydratedDocument<Job>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
})
export class Job {
    _id: mongoose.Types.ObjectId;

    @Prop({ type: String, unique: true })
    name: string;

    @Prop({ type: String })
    description: string;

    @Prop({ type: String })
    slug: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.pre('save', function (next) {
    this.slug = StringHelper.textToSlug(this.name);
    next();
});

JobSchema.pre('updateOne', function (next) {
    const data = this.getUpdate();
    const slug = StringHelper.textToSlug(data['name']);

    this.set({ slug: slug });

    next();
});

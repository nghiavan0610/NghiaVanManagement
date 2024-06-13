import { Member } from '@/project-management/member/schemas/member.schema';
import { StringHelper } from '@/shared/helpers/string.helper';
import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose, { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
})
export class Project {
    _id: mongoose.Types.ObjectId;

    @Prop({ type: String, unique: true })
    name: string;

    @Prop({ type: String, unique: true })
    code: string;

    @Prop({ type: String })
    location: string;

    @Prop({ type: String })
    description: string;

    @Prop({ type: Date, default: Date.now() })
    startedAt: Date;

    @Prop({ type: Boolean, default: false })
    isDone: boolean;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Member',
    })
    @Type(() => Member)
    members: Member[];

    @Prop({ type: String })
    slug: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.pre('save', function (next) {
    this.slug = StringHelper.textToSlug(this.name);
    next();
});

ProjectSchema.pre('updateOne', function (next) {
    const data = this.getUpdate();
    const slug = StringHelper.textToSlug(data['name']);

    this.set({ slug: slug });

    next();
});

import { Job } from '@/job/schemas/job.schema';
import { StringHelper } from '@/shared/helpers/string.helper';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum Gender {
    male = 'male',
    female = 'female',
    none = 'none',
}

export enum Role {
    admin = 'admin',
    manager = 'manager',
    user = 'user',
}

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
})
export class User {
    _id: mongoose.Types.ObjectId;

    @Prop({ type: String, unique: true })
    username: string;

    @Prop({ type: String })
    name: string;

    @Prop({ type: String, index: true })
    email: string;

    @Prop({
        type: String,
    })
    password: string;

    @Prop({
        type: String,
        enum: Gender,
        default: Gender.none,
    })
    gender: Gender;

    @Prop({ type: Date })
    dob: Date;

    @Prop({ type: String, index: true })
    phoneNumber: string;

    @Prop({ type: String })
    address: string;

    @Prop({
        type: String,
        enum: Role,
        default: Role.user,
    })
    role: Role;

    @Prop({ type: Boolean, default: false })
    deleted: boolean;

    @Prop({ type: String })
    slug: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Job.name,
    })
    @Type(() => Job)
    job: Job;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
    this.slug = StringHelper.textToSlug(this.name);
    next();
});

UserSchema.pre('updateOne', function (next) {
    const data = this.getUpdate();
    const slug = StringHelper.textToSlug(data['name']);

    this.set({ slug: slug });

    next();
});

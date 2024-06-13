import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<AuthUser>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
})
export class AuthUser {
    _id: mongoose.Types.ObjectId;

    @Prop({ type: String })
    userId: string;

    @Prop({ type: String, unique: true })
    sessionId: string;

    @Prop({ type: String })
    deviceId: string;

    @Prop({ type: String })
    deviceType: string;
}

export const AuthUserSchema = SchemaFactory.createForClass(AuthUser);

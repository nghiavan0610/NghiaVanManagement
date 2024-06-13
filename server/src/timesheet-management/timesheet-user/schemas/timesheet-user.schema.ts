import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Type } from 'class-transformer';
import { Member } from '@/project-management/member/schemas/member.schema';
import { Shift } from '@/shared/enums/shift.enum';

export type TimesheetUserDocument = HydratedDocument<TimesheetUser>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
})
export class TimesheetUser {
    _id: mongoose.Types.ObjectId;

    @Prop({
        type: Date,
        default: Date.now(),
    })
    date: Date;

    @Prop({
        type: Number,
        enum: Shift,
    })
    shift: Shift;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Member',
    })
    @Type(() => Member)
    members: Member[];
}

export const TimesheetUserSchema = SchemaFactory.createForClass(TimesheetUser);

TimesheetUserSchema.index({ date: 1, shift: 1 }, { unique: true });

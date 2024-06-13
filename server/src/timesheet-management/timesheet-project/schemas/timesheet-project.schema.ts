import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Type } from 'class-transformer';
import { Project } from '@/project-management/project/schemas/project.schema';
import { Member } from '@/project-management/member/schemas/member.schema';
import { Shift } from '@/shared/enums/shift.enum';

export type TimesheetProjectDocument = HydratedDocument<TimesheetProject>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
})
export class TimesheetProject {
    _id: mongoose.Types.ObjectId;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    })
    @Type(() => Project)
    project: Project;

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

export const TimesheetProjectSchema = SchemaFactory.createForClass(TimesheetProject);

TimesheetProjectSchema.index({ project: 1, date: 1, shift: 1 }, { unique: true });

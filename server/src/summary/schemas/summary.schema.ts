import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Type } from 'class-transformer';
import { Route } from './route.schema';
import { Project } from '@/project-management/project/schemas/project.schema';

export type SummaryDocument = HydratedDocument<Summary>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
})
export class Summary {
    _id: mongoose.Types.ObjectId;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        index: true,
    })
    @Type(() => Project)
    project: Project;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Route',
    })
    @Type(() => Route)
    routes: Route[];

    @Prop({ type: Boolean, default: false })
    isOriginal: boolean;
}

export const SummarySchema = SchemaFactory.createForClass(Summary);

SummarySchema.index({ project: 1, isOriginal: 1 }, { unique: true });

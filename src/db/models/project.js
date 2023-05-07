const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const emptyStringToNull = require('../../utils/emptyStringToNull');

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            validate: {
                validator: (v) => {
                    return typeof v === 'string' && v.trim().length > 0;
                },
                message: 'Please provide a project name',
            },
        },
        code: {
            type: String,
            unique: true,
            validate: {
                validator: (v) => {
                    return typeof v === 'string' && v.trim().length > 0;
                },
                message: 'Please provide project code',
            },
        },
        location: {
            type: String,
            validate: {
                validator: (v) => {
                    return typeof v === 'string' && v.trim().length > 0;
                },
                message: 'Please provide project location',
            },
        },
        description: { type: String },
        startedAt: {
            type: Date,
            validate: [
                (v) => {
                    if (!v) return true;
                    const dateOnly = v.toISOString().slice(0, 10);
                    const regex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
                    return regex.test(dateOnly);
                },
                `Wrong date format! Please enter a date in the format YYYY-MM-DD.`,
            ],
            default: Date.now(),
        },
        manager: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
        leaders: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
        members: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
        originalSummary: { type: mongoose.SchemaTypes.ObjectId, ref: 'Summary' },
        updatedSummary: { type: mongoose.SchemaTypes.ObjectId, ref: 'Summary' },
        timesheet: { type: mongoose.SchemaTypes.ObjectId, ref: 'Timesheet' },
        isDone: { type: Boolean, default: false },
        deleted: { type: Boolean, default: false },
        deletedBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
        slug: { type: String, slug: 'name', slugPaddingSize: 2, unique: true },
    },
    {
        timestamps: true,
    },
);

projectSchema.plugin(slug);
projectSchema.plugin(emptyStringToNull);

module.exports = mongoose.models.Project || mongoose.model('Project', projectSchema);

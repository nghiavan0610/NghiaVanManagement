const mongoose = require('mongoose');
const emptyStringToNull = require('../../utils/emptyStringToNull');

const timesheetSchema = new mongoose.Schema(
    {
        project: { type: mongoose.SchemaTypes.ObjectId, ref: 'Project' },
        manager: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
        members: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
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
        timesheetDetails: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'TimesheetDetail' }],
        monthYear: { type: String },
    },
    {
        timestamps: true,
    },
);

timesheetSchema.index({ project: 1, monthYear: 1 });

timesheetSchema.plugin(emptyStringToNull);

module.exports = mongoose.models.Timesheet || mongoose.model('Timesheet', timesheetSchema);

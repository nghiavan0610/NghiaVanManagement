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
        timesheetDetail: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'TimesheetDetail' }],
    },
    {
        timestamps: true,
    },
);

timesheetSchema.plugin(emptyStringToNull);

module.exports = mongoose.models.Timesheet || mongoose.model('Timesheet', timesheetSchema);

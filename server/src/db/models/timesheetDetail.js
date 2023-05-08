const mongoose = require('mongoose');
const emptyStringToNull = require('../../utils/emptyStringToNull');

const timesheetDetailSchema = new mongoose.Schema(
    {
        timesheet: { type: mongoose.SchemaTypes.ObjectId, ref: 'Timesheet' },
        workDate: {
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
        proofs: [
            {
                proofName: { type: String },
                proofUri: {
                    type: String,
                    validate: {
                        validator: (v) => {
                            return typeof v === 'string' && v.trim().length > 0;
                        },
                        message: 'Please provide proof',
                    },
                },
                isApproved: { type: Boolean, default: false },
            },
        ],
        comment: { type: String },
    },
    {
        timestamps: true,
    },
);
timesheetDetailSchema.index({ timesheet: 1, workDate: 1 });

timesheetDetailSchema.plugin(emptyStringToNull);

module.exports = mongoose.models.TimesheetDetail || mongoose.model('TimesheetDetail', timesheetDetailSchema);

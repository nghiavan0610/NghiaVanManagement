const mongoose = require('mongoose');
const emptyStringToNull = require('../../utils/emptyStringToNull');

const summarySchema = new mongoose.Schema(
    {
        project: { type: mongoose.SchemaTypes.ObjectId, ref: 'Project' },
        routes: [
            {
                name: { type: String },
                stations: [
                    {
                        name: { type: String },
                        pillars: [
                            {
                                name: { type: String },
                                distance: { type: Number, float: true },
                                middleLine: { type: Number, float: true },
                                lowLine: { type: Number, float: true },
                                description: { type: String },
                                trus: [
                                    {
                                        detail: { type: mongoose.SchemaTypes.ObjectId, ref: 'Tru' },
                                        quantity: { type: Number },
                                        comment: { type: String },
                                        isDone: { type: Boolean, default: false },
                                        isRecalled: { type: Boolean, default: false },
                                    },
                                ],
                                boChangs: [
                                    {
                                        detail: { type: mongoose.SchemaTypes.ObjectId, ref: 'BoChang' },
                                        quantity: { type: Number },
                                        comment: { type: String },
                                        isDone: { type: Boolean, default: false },
                                        isRecalled: { type: Boolean, default: false },
                                    },
                                ],
                                mongs: [
                                    {
                                        detail: { type: mongoose.SchemaTypes.ObjectId, ref: 'Mong' },
                                        quantity: { type: Number },
                                        comment: { type: String },
                                        isDone: { type: Boolean, default: false },
                                        isRecalled: { type: Boolean, default: false },
                                    },
                                ],
                                dayDans: [
                                    {
                                        detail: { type: mongoose.SchemaTypes.ObjectId, ref: 'DayDan' },
                                        quantity: { type: Number, float: true },
                                        comment: { type: String },
                                        isDone: { type: Boolean, default: false },
                                        isRecalled: { type: Boolean, default: false },
                                    },
                                ],
                                xaSus: [
                                    {
                                        detail: { type: mongoose.SchemaTypes.ObjectId, ref: 'XaSu' },
                                        quantity: { type: Number },
                                        comment: { type: String },
                                        isDone: { type: Boolean, default: false },
                                        isRecalled: { type: Boolean, default: false },
                                    },
                                ],
                                tiepDias: [
                                    {
                                        detail: { type: mongoose.SchemaTypes.ObjectId, ref: 'TiepDia' },
                                        quantity: { type: Number },
                                        comment: { type: String },
                                        isDone: { type: Boolean, default: false },
                                        isRecalled: { type: Boolean, default: false },
                                    },
                                ],
                                das: [
                                    {
                                        detail: { type: mongoose.SchemaTypes.ObjectId, ref: 'Da' },
                                        quantity: { type: Number },
                                        comment: { type: String },
                                        isDone: { type: Boolean, default: false },
                                        isRecalled: { type: Boolean, default: false },
                                    },
                                ],
                                phuKiens: [
                                    {
                                        detail: { type: mongoose.SchemaTypes.ObjectId, ref: 'PhuKien' },
                                        quantity: { type: Number },
                                        comment: { type: String },
                                        isDone: { type: Boolean, default: false },
                                        isRecalled: { type: Boolean, default: false },
                                    },
                                ],
                                thietBis: [
                                    {
                                        detail: { type: mongoose.SchemaTypes.ObjectId, ref: 'ThietBi' },
                                        quantity: { type: Number },
                                        comment: { type: String },
                                        isDone: { type: Boolean, default: false },
                                        isRecalled: { type: Boolean, default: false },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        isOriginal: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

summarySchema.index({ project: 1, isOriginal: 1 }, { unique: true });

summarySchema.plugin(emptyStringToNull);

module.exports = mongoose.models.Summary || mongoose.model('Summary', summarySchema);

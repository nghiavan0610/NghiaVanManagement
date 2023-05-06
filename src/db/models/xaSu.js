const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const emptyStringToNull = require('../../utils/emptyStringToNull');
const { ValidationError } = require('../../helpers/ErrorHandler');

mongoose.plugin(slug);

const xaSuSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            validate: {
                validator: (v) => {
                    return typeof v === 'string' && v.trim().length > 0;
                },
                message: 'Please provide a `Xà hoặc Sứ` name',
            },
        },
        deleted: { type: Boolean, default: false },
        deletedBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
        slug: { type: String, slug: 'name', slugPaddingSize: 2, unique: true },
    },
    {
        timestamps: true,
    },
);

xaSuSchema.plugin(emptyStringToNull);

module.exports = mongoose.models.XaSu || mongoose.model('XaSu', xaSuSchema);

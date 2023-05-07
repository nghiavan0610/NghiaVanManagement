const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const emptyStringToNull = require('../../utils/emptyStringToNull');
const { ValidationError } = require('../../helpers/ErrorHandler');

mongoose.plugin(slug);

const tiepDiaSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            validate: {
                validator: (v) => {
                    return typeof v === 'string' && v.trim().length > 0;
                },
                message: 'Please provide a `Tiếp địa` name',
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

tiepDiaSchema.plugin(emptyStringToNull);

module.exports = mongoose.models.TiepDia || mongoose.model('TiepDia', tiepDiaSchema);

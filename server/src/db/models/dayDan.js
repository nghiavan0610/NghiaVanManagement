const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const emptyStringToNull = require('../../utils/emptyStringToNull');

mongoose.plugin(slug);

const dayDanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            validate: {
                validator: (v) => {
                    return typeof v === 'string' && v.trim().length > 0;
                },
                message: 'Please provide a `Dây dẫn` name',
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

dayDanSchema.plugin(emptyStringToNull);

module.exports = mongoose.models.DayDan || mongoose.model('DayDan', dayDanSchema);

const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const emptyStringToNull = require('../../utils/emptyStringToNull');

mongoose.plugin(slug);

const jobSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            validate: {
                validator: (v) => {
                    return typeof v === 'string' && v.trim().length > 0;
                },
                message: 'Please provide a job name',
            },
        },
        description: String,
        slug: { type: String, slug: 'name', slugPaddingSize: 2, unique: true },
    },
    {
        timestamps: true,
    },
);

jobSchema.plugin(emptyStringToNull);

module.exports = mongoose.models.Job || mongoose.model('Job', jobSchema);

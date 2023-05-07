const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const bcrypt = require('bcrypt');
const emptyStringToNull = require('../../utils/emptyStringToNull');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: [true, 'Please provide user name'],
            validate: {
                validator: (v) => {
                    return typeof v === 'string' && v.trim().length > 0;
                },
                message: 'Username must be a non-empty string',
            },
        },
        name: {
            type: String,
            required: [true, 'Please provide full name for this user'],
            validate: {
                validator: (v) => {
                    return typeof v === 'string' && v.trim().length > 0;
                },
                message: 'Full name must be a non-empty string',
            },
        },
        email: {
            type: String,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid Email Address'],
        },
        password: {
            type: String,
            select: false,
        },
        gender: {
            type: String,
            enum: {
                values: ['none', 'male', 'female'],
                message: 'gender {VALUE} is not supported',
            },
            default: 'none',
        },
        DOB: {
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
            min: ['1960-01-01', 'Your birthday must be greater than present 1960'],
            max: [new Date(), 'Your birthday cannot be greater than present year'],
        },
        phoneNumber: {
            type: String,
            match: [/^[0-9]+$/, 'Wrong phone number format'],
            minLength: [9, 'Your phone number must between 9 and 11 numbers'],
            maxLength: [11, 'Your phone number must between 9 and 11 numbers'],
        },
        address: String,
        role: {
            type: String,
            enum: {
                message: 'role {VALUE} is not supported',
                values: ['admin', 'manager', 'user'],
            },
            default: 'user',
        },
        job: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Job',
        },
        projects: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Project' }],
        deleted: { type: Boolean, default: false },
        deletedBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
        slug: { type: String, slug: 'name', slugPaddingSize: 2, unique: true },
    },
    {
        timestamps: true,
    },
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

userSchema.plugin(slug);
userSchema.plugin(emptyStringToNull);

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

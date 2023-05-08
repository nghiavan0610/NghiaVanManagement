const emptyStringToNull = (schema) => {
    schema.pre('validate', function () {
        const keys = Object.keys(this.toObject());
        keys.forEach((key) => {
            if (this[key] === '') {
                const defaultValue = schema.path(key).defaultValue;
                this[key] = defaultValue !== undefined ? defaultValue : null;
            }
        });
    });
};

module.exports = emptyStringToNull;

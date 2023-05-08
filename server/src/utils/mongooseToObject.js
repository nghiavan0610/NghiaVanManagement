module.exports = {
    multipleMongooseToObject: function (mongooses) {
        return mongooses.map((mongoose) => {
            const object = mongoose.toObject();
            object.password ? delete object.password : null;
            return object;
        });
    },
    mongooseToObject: function (mongoose) {
        const object = mongoose.toObject();
        object.password ? delete object.password : null;
        return object;
    },
};

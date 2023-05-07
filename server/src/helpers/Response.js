const response = (payload, ...rest) => {
    return {
        success: 'true',
        data: payload,
        ...rest,
    };
};

module.exports = { response };

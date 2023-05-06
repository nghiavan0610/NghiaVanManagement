const formatDate = (inputDate) => {
    const date = new Date(inputDate);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return { day, month, year };
};

const formatVietnamDate = (inputDate) => {
    const date = new Date(inputDate);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const outputString = `ngày ${day} tháng ${month} năm ${year}`;
    return outputString;
};

module.exports = { formatDate, formatVietnamDate };

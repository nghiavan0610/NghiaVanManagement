const config = require('../configs/env');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { ApiError } = require('../helpers/ErrorHandler');

const s3 = new aws.S3({
    accessKeyId: config.S3_ACCESS_KEY,
    secretAccessKey: config.S3_SECRET_KEY,
    endpoint: `https://${config.S3_HOSTNAME}`,
    s3ForcePathStyle: true,
});

const uploadS3 = multer({
    storage: multerS3({
        s3: s3,
        bucket: config.S3_BUCKET,
        acl: 'public-read',
        contentDisposition: 'inline',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldname: file.fieldname });
        },
        key: (req, file, cb) => {
            const key = `${req.params.projectSlug}/${file.fieldname}-${file.originalname
                .split('.')
                .shift()}_${uuidv4()}.${file.mimetype.split('/').pop()}`;
            cb(null, key);
        },
    }),
    fileFilter: (req, file, cb) => {
        const acceptedTypes = file.mimetype.split('/');
        if (
            acceptedTypes[0] === 'image' ||
            acceptedTypes[1] === 'pdf' ||
            acceptedTypes[1] === 'vnd.ms-excel' ||
            acceptedTypes[1] === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type.'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const removeS3 = async (key) => {
    try {
        const params = {
            Bucket: config.S3_BUCKET,
            Key: key,
        };
        await s3.deleteObject(params).promise();
    } catch (err) {
        throw new ApiError(403, 'Failed to delete file: ' + err.message);
    }
};

const getS3 = async (key) => {
    try {
        const params = {
            Bucket: config.S3_BUCKET,
            Key: key,
        };
        const data = await s3.getObject(params).promise();
        return data;
    } catch (err) {
        throw new ApiError(403, 'Failed to get file: ' + err.message);
    }
};

module.exports = { uploadS3, removeS3, getS3 };

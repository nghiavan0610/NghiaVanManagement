import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
    s3: {
        accessKey: process.env.S3_ACCESS_KEY,
        secretKey: process.env.S3_SECRET_KEY,
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
        bucket: process.env.S3_BUCKET,
    },
}));

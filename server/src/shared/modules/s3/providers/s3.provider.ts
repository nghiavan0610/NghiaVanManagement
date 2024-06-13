import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const S3ClientProvider: Provider = {
    provide: 'S3_CLIENT',
    useFactory: async (configService: ConfigService) => {
        const config: S3ClientConfig = {
            credentials: {
                accessKeyId: configService.get('aws.s3.accessKey'),
                secretAccessKey: configService.get('aws.s3.secretKey'),
            },
            region: configService.get('aws.s3.region'),
            // Need endpoint because not using AWS S3
            endpoint: configService.get('aws.s3.endpoint'),
        };

        const client = new S3Client(config);

        return client;
    },
    inject: [ConfigService],
};

import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import appConfigMap from './config-maps/app.config-map';
import authConfigMap from './config-maps/auth.config-map';
import loggerConfigMap from './config-maps/logger.config-map';
import redisConfigMap from './config-maps/redis.config-map';
import mongodbConfigMap from './config-maps/mongodb.config-map';
import swaggerConfigMap from './config-maps/swagger.config-map';
import awsConfigMap from './config-maps/aws.config-map';

@Global()
@Module({})
export class AppConfigModule {
    static load(): DynamicModule {
        const envFilePath = [`.env.${process.env.NODE_ENV}`, '.env'];

        return {
            module: AppConfigModule,
            imports: [
                NestConfigModule.forRoot({
                    load: [
                        appConfigMap,
                        swaggerConfigMap,
                        authConfigMap,
                        loggerConfigMap,
                        mongodbConfigMap,
                        redisConfigMap,
                        awsConfigMap,
                    ],
                    envFilePath,
                }),
            ],
            providers: [ConfigService],
            exports: [ConfigService],
        };
    }
}

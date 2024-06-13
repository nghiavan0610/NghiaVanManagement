import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({})
export class MongoModule {
    static load(): DynamicModule {
        return {
            module: MongoModule,
            imports: [
                MongooseModule.forRootAsync({
                    imports: [ConfigModule],
                    useFactory: async (configService: ConfigService) => ({
                        uri: configService.get('mongodb.databaseUrl'),
                        dbName: configService.get('mongodb.dbName'),
                        authSource: configService.get('mongodb.authSource'),
                    }),
                    inject: [ConfigService],
                }),
            ],
        };
    }
}

import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import appConfigMap from './config/config-maps/app.config-map';
import { GlobalValidationPipe } from './shared/pipes/global-validation.pipe';
import { AllExceptionFilter } from './shared/filters/all-exception.filter';
import { GlobalClassSerializerPipe } from './shared/pipes/global-class-serializer.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { json } from 'express';

// Swagger
async function registerSwagger(app: INestApplication) {
    const configService = app.get<ConfigService>(ConfigService);

    const builtDocument = new DocumentBuilder()
        .setTitle(configService.get('swagger.title'))
        .setDescription(configService.get('swagger.description'))
        .setVersion(configService.get('swagger.version'))
        .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            in: 'header',
            name: 'authorization',
        })
        .build();

    const document = SwaggerModule.createDocument(app, builtDocument);
    SwaggerModule.setup(configService.get('swagger.path'), app, document);
}

// Config
async function registerConfiguration(app: INestApplication, appConfig) {
    app.enableCors({
        origin: <string>appConfig.allowedOrigin,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });
    app.use(json({ limit: '500mb' }));
    app.use(helmet());
    app.enableShutdownHooks();
}

// Logger
async function registerLogger(app: INestApplication) {
    const configService = app.get<ConfigService>(ConfigService);

    app.useLogger(configService.get('logger.level'));
}

// Filters
function registerGlobalFilters(app: INestApplication) {
    const { httpAdapter } = app.get<HttpAdapterHost>(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionFilter(httpAdapter));
}

// Global Pipes
function registerGlobalPipes(app: INestApplication) {
    app.useGlobalPipes(new GlobalValidationPipe().default());
}

// Interceptors
function registerGlobalInterceptors(app: INestApplication) {
    const reflector = app.get(Reflector);

    app.useGlobalInterceptors(new GlobalClassSerializerPipe(reflector).default());
}

// Main
async function bootstrap() {
    const appConfig = appConfigMap();

    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix(`v1`);

    registerSwagger(app);
    registerConfiguration(app, appConfig);
    registerLogger(app);
    registerGlobalPipes(app);
    registerGlobalFilters(app);
    registerGlobalInterceptors(app);

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    const configService = app.get<ConfigService>(ConfigService);

    const appPort = configService.get('app.port');
    const appEnv = configService.get('app.env');

    await app.listen(appPort);

    console.info(`App is running at http://localhost:${appPort}, env: ${appEnv}`);
}
bootstrap();

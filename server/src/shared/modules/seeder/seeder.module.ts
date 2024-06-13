import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { MongoModule } from '../mongo/mongo.module';
import { UserModule } from '@/user/user.module';
import { AdminModule } from '@/admin/admin.module';
import { AuthUserModule } from '@/auth-user/auth-user.module';
import { AuthModule } from '@/auth/auth.module';
import { JobModule } from '@/job/job.module';
import { ProjectModule } from '@/project-management/project/project.module';
import { LoggerModule } from '../logger/logger.module';
import appConfigMap from '@/config/config-maps/app.config-map';
import { AppConfigModule } from '@/config/config.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from '@/health/health.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../redis/redis.module';
import { MaterialModule } from '@/supply/material/material.module';
import { SummaryModule } from '@/summary/summary.module';
import { CategoryModule } from '@/supply/category/category.module';
import { MemberModule } from '@/project-management/member/member.module';
import { ProofModule } from '@/project-management/proof/proof.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [appConfigMap] }),
        AppConfigModule.load(),
        HealthModule,
        LoggerModule,
        MongoModule.load(),
        RedisModule,
        UserModule,
        JobModule,
        AuthModule,
        AuthUserModule,
        JwtModule.register({ global: true }),
        AdminModule,
        ProjectModule,
        MemberModule,
        SummaryModule,
        MaterialModule,
        CategoryModule,
        ProofModule,
    ],
    providers: [SeederService],
})
export class SeederModule {}

import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { ConfigModule } from '@nestjs/config';
import appConfigMap from './config/config-maps/app.config-map';
import { LoggerModule } from './shared/modules/logger/logger.module';
import { RedisModule } from './shared/modules/redis/redis.module';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { MongoModule } from './shared/modules/mongo/mongo.module';
import { JobModule } from './job/job.module';
import { AuthModule } from './auth/auth.module';
import { AuthUserModule } from './auth-user/auth-user.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './shared/guards/access-token.guard';
import { AccessTokenStrategy } from './shared/stategies/access-token.strategy';
import { RefreshTokenStrategy } from './shared/stategies/refresh-token.strategy';
import { AdminModule } from './admin/admin.module';
import { ProjectModule } from './project-management/project/project.module';
import { SeederModule } from './shared/modules/seeder/seeder.module';
import { UploadModule } from './upload/upload.module';
import { S3Module } from './shared/modules/s3/s3.module';
import { UtilModule } from './shared/modules/utils/util.module';
import { TaskModule } from './task/task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LeaveModule } from './timesheet-management/leave/leave.module';
import { ExportModule } from './export/export.module';
import { MaterialModule } from './supply/material/material.module';
import { SummaryModule } from './summary/summary.module';
import { CategoryModule } from './supply/category/category.module';
import { ImportModule } from './import/import.module';
import { ReportModule } from './report/report.module';
import { MemberModule } from './project-management/member/member.module';
import { CommentModule } from './project-management/comment/comment.module';
import { BoardModule } from './project-management/board/board.module';
import { ProofModule } from './project-management/proof/proof.module';
import { TimesheetProjectModule } from './timesheet-management/timesheet-project/timesheet-project.module';
import { TimesheetUserModule } from './timesheet-management/timesheet-user/timesheet-user.module';
import { TimesheetModule } from './timesheet-management/timesheet/timesheet.module';
import { DeployModule } from './deploy/deploy.module';

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
        SeederModule,
        UploadModule,
        S3Module,
        UtilModule,
        TaskModule,
        ScheduleModule.forRoot(),
        LeaveModule,
        ExportModule,
        SummaryModule,
        MaterialModule,
        CategoryModule,
        ImportModule,
        ReportModule,
        CommentModule,
        BoardModule,
        ProofModule,
        TimesheetProjectModule,
        TimesheetUserModule,
        TimesheetModule,
        DeployModule,
    ],
    providers: [{ provide: APP_GUARD, useClass: AccessTokenGuard }, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AppModule {}

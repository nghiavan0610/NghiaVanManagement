import { Global, Module } from '@nestjs/common';
import { JobServiceProvider } from './providers/job-service.provider';
import { IJobService } from './services/job-service.interface';
import { Job, JobSchema } from './schemas/job.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JobRepository } from './repositories/job.repository';
import { JobController } from './controllers/job.controller';
import { IsUniqueJobName } from './validators/job-name.validator';
import { UserModule } from '@/user/user.module';
import { JobSeeder } from './seeders/job.seeder';

@Global()
@Module({
    imports: [MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]), UserModule],
    controllers: [JobController],
    providers: [JobServiceProvider, JobRepository, IsUniqueJobName, JobSeeder],
    exports: [IJobService, JobSeeder],
})
export class JobModule {}

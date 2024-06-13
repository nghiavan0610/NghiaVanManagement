import { Module, forwardRef } from '@nestjs/common';
import { LeaveController } from './controllers/leave.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveRepository } from './repositories/leave.repository';
import { Leave, LeaveSchema } from './schemas/leave.schema';
import { ProjectModule } from '@/project-management/project/project.module';
import { ILeaveService } from './services/leave-service.interface';
import { LeaveServiceProvider } from './providers/leave-service.provider';

@Module({
    imports: [MongooseModule.forFeature([{ name: Leave.name, schema: LeaveSchema }]), forwardRef(() => ProjectModule)],
    controllers: [LeaveController],
    providers: [LeaveServiceProvider, LeaveRepository],
    exports: [ILeaveService],
})
export class LeaveModule {}

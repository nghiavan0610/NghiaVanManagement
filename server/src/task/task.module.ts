import { Module } from '@nestjs/common';
import { TaskServiceProvider } from './providers/task.provider';
import { BoardModule } from '@/project-management/board/board.module';
import { TimesheetProjectModule } from '@/timesheet-management/timesheet-project/timesheet-project.module';
import { TimesheetUserModule } from '@/timesheet-management/timesheet-user/timesheet-user.module';
import { ProofModule } from '@/project-management/proof/proof.module';

@Module({
    imports: [BoardModule, ProofModule, TimesheetProjectModule, TimesheetUserModule],
    providers: [TaskServiceProvider],
})
export class TaskModule {}

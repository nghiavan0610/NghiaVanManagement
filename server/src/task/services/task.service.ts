import { Inject, Injectable } from '@nestjs/common';
import { ITaskService } from './task-service.interface';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DateTimeHelper } from '@/shared/helpers/date-time.helper';
import { IBoardService } from '@/project-management/board/services/board-service.interface';
import { ITimesheetProjectService } from '@/timesheet-management/timesheet-project/services/timesheet-project-service.interface';
import { IProofService } from '@/project-management/proof/services/proof-service.interface';
import { ITimesheetUserService } from '@/timesheet-management/timesheet-user/services/timesheet-user-service.interface';
import { PROOF_NAME_START_WITH } from '@/project-management/proof/constants/proof.constant';

@Injectable()
export class TaskService implements ITaskService {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly configService: ConfigService,
        @Inject(IBoardService) private readonly boardService: IBoardService,
        @Inject(IProofService) private readonly proofService: IProofService,
        @Inject(ITimesheetProjectService) private readonly timesheetProjectService: ITimesheetProjectService,
        @Inject(ITimesheetUserService) private readonly timesheetUserService: ITimesheetUserService,
    ) {}

    // @Cron('* * * * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
    @Cron('30 23 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
    async approveTimesheet(): Promise<void> {
        const date = DateTimeHelper.getDateTimeInTz(this.configService.get('app.timezone'), new Date());
        const endOfDate = DateTimeHelper.getEndOfDate(new Date(date));

        this.logger.info('[TASK APPROVE PROOFS] endOfDate', endOfDate);

        const subtractEndOfDate = DateTimeHelper.subtractDay(endOfDate, 0);

        try {
            const boards = await this.boardService._findAllBoard(
                {
                    createdAt: { $lte: subtractEndOfDate },
                    isLocked: false,
                },
                null,
                { populate: 'proofs' },
            );

            if (boards.length === 0) {
                return;
            }

            const approvedProofList: string[] = [];
            const uniqueMemberIds = new Set();

            const timesheetProjectsPromises = boards.map(async (board) => {
                const proofsPromises = board.proofs.map(async (proof) => {
                    if (!proof.isApproved && proof.name.startsWith(PROOF_NAME_START_WITH)) {
                        approvedProofList.push(proof._id.toString());
                        uniqueMemberIds.add(proof.author._id.toString());
                    }
                });
                await Promise.all(proofsPromises);

                return this.timesheetProjectService._findOneAndUpdateTimesheetProject(
                    { project: board.project, date: board.date, shift: board.shift },
                    {
                        project: board.project,
                        date: board.date,
                        shift: board.shift,
                        $push: { members: { $each: [...uniqueMemberIds] } },
                    },
                    { upsert: true, returnDocument: 'after' },
                );
            });

            const timesheetProjects = await Promise.all(timesheetProjectsPromises);

            await Promise.all(
                timesheetProjects.map(async (timesheetProject) => {
                    const timesheetUser = await this.timesheetUserService._findOneAndUpdateTimesheetUser(
                        {
                            date: timesheetProject.date,
                            shift: timesheetProject.shift,
                        },
                        {
                            date: timesheetProject.date,
                            shift: timesheetProject.shift,
                        },
                        { upsert: true, returnDocument: 'after' },
                    );

                    timesheetProject.members.forEach(async (projectMember) => {
                        const existedMember = timesheetUser?.members.some(
                            (userMember) => userMember.toString() === projectMember.toString(),
                        );
                        if (!existedMember) {
                            await this.timesheetUserService._updateOneTimesheetUser(
                                { _id: timesheetUser._id },
                                { $push: { members: projectMember.toString() } },
                            );
                        }
                    });
                }),
            );

            // Approve proofs
            await this.proofService._updateManyProof({ _id: { $in: approvedProofList } }, { isApproved: true });

            // Lock boards
            const boardIds = boards.map((board) => board._id.toString());
            await this.boardService._updateManyBoard({ _id: { $in: boardIds } }, { isLocked: true });
        } catch (error) {
            this.logger.error('[approveTimesheet] error', error.message);
        }
    }
}

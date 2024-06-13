import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { ILeaveService } from './leave-service.interface';
import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { CustomException } from '@/shared/exceptions/custom.exception';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { LeaveShiftDto, RequestLeaveDto } from '../dtos/request/request-leave.dto';
import { LeaveRepository } from '../repositories/leave.repository';
import { IProjectService } from '@/project-management/project/services/project-service.interface';
import { Leave } from '../schemas/leave.schema';
import { LeaveDetailResponseDataDto } from '../dtos/response/leave-detail-response.dto';
import { GetLeaveListDto } from '../dtos/request/get-leave-list.dto';
import { DateTimeHelper } from '@/shared/helpers/date-time.helper';
import { FilterQuery, ProjectionType, QueryOptions } from 'mongoose';

@Injectable()
export class LeaveService implements ILeaveService {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly leaveRepository: LeaveRepository,
        @Inject(forwardRef(() => IProjectService)) private readonly projectService: IProjectService,
    ) {}

    // [GET] /leaves/:id
    async getLeaveDetail(id: string): Promise<LeaveDetailResponseDataDto> {
        this.logger.info('[GET LEAVE DETAIL], id', id);

        return this.leaveRepository.findById(id, null, {
            populate: {
                path: 'users',
                populate: 'job',
            },
        });
    }

    // [GET] /leaves?month=
    async getLeaveListByMonth(filters: GetLeaveListDto): Promise<LeaveDetailResponseDataDto[]> {
        this.logger.info('[GET LEAVE LIST], filters', filters);

        const filter: any = {
            users: filters.userId,
        };

        if (filters?.month) {
            const firstDay = DateTimeHelper.getFirstDayOfMonth(filters?.month);
            const lastDay = DateTimeHelper.getLastDayOfMonth(filters?.month);

            filter.date = {
                $gte: firstDay,
                $lte: lastDay,
            };
        }

        return this.leaveRepository.findAll(filter, null, {
            populate: {
                path: 'users',
                populate: 'job',
            },
            sort: {
                date: 1,
                shift: 1,
            },
        });
    }

    // [POST] /leaves
    async requestLeave(requestLeaveDto: RequestLeaveDto): Promise<boolean> {
        this.logger.info('[REQUEST LEAVE], requestLeaveDto', requestLeaveDto);

        const { userId, projectId, dates, shift } = requestLeaveDto;

        // Check exist project
        const project = await this.projectService._findByIdProject(projectId);
        if (!project) {
            throw new CustomException({
                message: ProjectError.PROJECT_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // TODO: Check User belong to Project or not
        // const timesheetMemberIds = project.members.map((memberId) => memberId.toString());
        // if (!timesheetMemberIds.some((id) => id === userId)) {
        //     throw new CustomException({
        //         message: ProjectError.USER_NOT_BELONG_TO_PROJECT,
        //         statusCode: HttpStatus.BAD_REQUEST,
        //     });
        // }

        // Upsert leave application
        await Promise.all(
            dates.map(async (date) => {
                const filter: any = {
                    project: projectId,
                    date: date,
                };

                if (shift === LeaveShiftDto.morning) {
                    filter.shift = { $in: [LeaveShiftDto.morning, LeaveShiftDto.evening] };
                } else {
                    filter.shift = shift;
                }

                // Create or Update Leaves
                const leaves = await this.leaveRepository.findAll(filter);

                if (leaves.length === 0) {
                    const shiftsToCreate =
                        shift === LeaveShiftDto.full ? [LeaveShiftDto.morning, LeaveShiftDto.evening] : [shift];

                    const createLeaveOperations = shiftsToCreate.map((shiftToCreate) => ({
                        project: projectId,
                        date: date,
                        shift: shiftToCreate,
                        users: userId,
                    }));

                    await Promise.all(
                        createLeaveOperations.map((createLeave) => this.leaveRepository.create(createLeave)),
                    );
                } else {
                    await Promise.all(
                        leaves.map(async (leave) => {
                            // Check if the user have applied for leave for this day? If not, add leave
                            const userIds = leave.users.map((user) => user._id.toString());
                            if (!userIds.some((id) => id === userId)) {
                                await this.leaveRepository.updateOne({ _id: leave._id }, { $push: { users: userId } });
                            }
                        }),
                    );
                }

                // Update relation Timesheet if it existed
                // const timesheets = await this.timesheetService._getTimesheetList(filter);

                // TODO:
                // await Promise.all(
                //     timesheets.map(async (timesheet) => {
                //         // Check if the user have applied for leave for this day? If not, add leave
                //         const userIds = timesheet.leavers.map((user) => user._id.toString());
                //         if (!userIds.some((id) => id === userId)) {
                //             await this.timesheetService._updateTimesheet(
                //                 { _id: timesheet._id },
                //                 { $push: { leavers: userId } },
                //             );
                //         }
                //     }),
                // );
            }),
        );

        return true;
    }

    // ============================ START COMMON FUNCTION ============================
    async _getLeaveDetail(
        filter: FilterQuery<Leave>,
        projection?: ProjectionType<Leave>,
        options?: QueryOptions<Leave>,
    ): Promise<Leave> {
        return this.leaveRepository.findOne(filter, projection, options);
    }
    // ============================ END COMMON FUNCTION ============================
}

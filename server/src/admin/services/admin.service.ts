import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IAdminService } from './admin-service.interface';
import { CreateUserDto } from '../dtos/request/create-user.dto';
import { IUserService } from '@/user/services/user-service.interface';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { IJobService } from '@/job/services/job-service.interface';
import { CustomException } from '@/shared/exceptions/custom.exception';
import { JobError } from '@/job/enums/job-error.enum';
import { IPasswordService } from '@/auth-user/services/password-service.interface';
import { UpdateUserDto } from '../dtos/request/update-user.dto';
import { UserError } from '@/user/enums/user-error.enum';
import { DeleteUserDto } from '../dtos/request/delete-user.dto';
import { RestoreUserDto } from '../dtos/request/restore-user.dto';
import { UserInfoResponseDataDto } from '@/user/dtos/response/user-info-response.dto';
import { IMemberService } from '@/project-management/member/services/member-service.interface';
import { MemberRole } from '@/project-management/member/schemas/member.schema';
import { AdminError } from '../enums/admin-error.enum';
import { IProjectService } from '@/project-management/project/services/project-service.interface';

@Injectable()
export class AdminService implements IAdminService {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        @Inject(IUserService) private readonly userService: IUserService,
        @Inject(IJobService) private readonly jobService: IJobService,
        @Inject(IPasswordService) private readonly passwordService: IPasswordService,
        @Inject(IProjectService) private readonly projectService: IProjectService,
        @Inject(IMemberService) private readonly memberService: IMemberService,
    ) {}

    // [POST] /admin/restore-user
    async restoreUser(restoreUserDto: RestoreUserDto): Promise<boolean> {
        this.logger.info('[ADMIN RESTORE USER], restoreUserDto', restoreUserDto);

        const user = await this.userService._getDeletedUser(restoreUserDto.id);
        if (!user) {
            throw new CustomException({
                message: UserError.USER_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        return this.userService._restoreUser(restoreUserDto.id);
    }

    // [DELETE] /admin/delete-user
    async deleteUser(deleteUserDto: DeleteUserDto): Promise<boolean> {
        this.logger.info('[ADMIN DELETE USER], deleteUserDto', deleteUserDto);

        const user = await this.userService._getUserById(deleteUserDto.id);
        if (!user) {
            throw new CustomException({
                message: UserError.USER_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Check Does User is manager of Project or not
        const members = await this.memberService._findAllMember({ user: deleteUserDto.id });

        const manager = members.find((member) => member.role === MemberRole.manager);
        if (manager) {
            throw new CustomException({
                message: AdminError.NOT_DELETE_MANAGER_OF_PROJECT,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        // Delete Members
        await this.memberService._deleteManyMember({ user: deleteUserDto.id });

        // Remove Member out of Project
        await this.projectService._updateProject(
            {
                members: { $in: members },
            },
            {
                members: { $pull: members },
            },
        );

        return this.userService._softDeleteUser(deleteUserDto.id);
    }

    // [POST] /admin/update-user
    async updateUser(updateUserDto: UpdateUserDto): Promise<boolean> {
        this.logger.info('[ADMIN UPDATE USER], updateUserDto', updateUserDto);

        const { id, ...restDto } = updateUserDto;

        const user = await this.userService._getUserById(id);
        if (!user) {
            throw new CustomException({
                message: UserError.USER_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Check existed attribute
        const [checkUsername, checkMail, checkPhone] = await Promise.all([
            this.userService._getUserForValidate({ username: updateUserDto.username }, id),
            this.userService._getUserForValidate({ email: updateUserDto.email }, id),
            this.userService._getUserForValidate({ phoneNumber: updateUserDto.phoneNumber }, id),
        ]);

        if (checkUsername) {
            throw new CustomException({
                message: UserError.USER_NAME_EXISTED,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }
        if (checkMail) {
            throw new CustomException({
                message: UserError.EMAIL_EXISTED,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }
        if (checkPhone) {
            throw new CustomException({
                message: UserError.PHONE_NUMBER_EXISTED,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        return this.userService._updateUser({ _id: id }, restDto);
    }

    // [POST] /admin/create-user
    async createUser(createUserDto: CreateUserDto): Promise<UserInfoResponseDataDto> {
        this.logger.info('[ADMIN CREATE USER], createUserDto', createUserDto);

        const { jobId, ...restDto } = createUserDto;

        const job = await this.jobService._getJobById(jobId);
        if (!job) {
            throw new CustomException({
                message: JobError.JOB_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        const hashPassword = await this.passwordService.encodePassword(restDto.username);

        return this.userService._createUser({
            ...restDto,
            password: hashPassword,
            job: jobId,
        });
    }
}

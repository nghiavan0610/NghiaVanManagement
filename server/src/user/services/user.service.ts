import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IUserService } from './user-service.interface';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { User } from '../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';
import { IPasswordService } from '@/auth-user/services/password-service.interface';
import { UserInfoResponseDataDto } from '../dtos/response/user-info-response.dto';
import { CustomException } from '@/shared/exceptions/custom.exception';
import { UserError } from '../enums/user-error.enum';
import { UpdateInfoDto } from '../dtos/request/update-info.dto';
import { ChangePasswordDto } from '../dtos/request/change-password.dto';
import { IAuthUserService } from '@/auth-user/services/auth-user-service.interface';
import { IRedisService } from '@/shared/modules/redis/services/redis-service.interface';
import { IToken } from '@/auth-user/interfaces/token.interface';
import { ITokenService } from '@/auth-user/services/token-service.interface';
import { FilterQuery, UpdateWriteOpResult } from 'mongoose';
import { CommonError } from '@/shared/enums/common-error.enum';

@Injectable()
export class UserService implements IUserService {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly userRepository: UserRepository,
        @Inject(IPasswordService) private readonly passwordService: IPasswordService,
        @Inject(IAuthUserService) private readonly authUserService: IAuthUserService,
        @Inject(IRedisService) private readonly redisService: IRedisService,
        @Inject(ITokenService) private readonly tokenService: ITokenService,
    ) {}

    // [PUT] /users/change-password
    async changePassword(changePasswordDto: ChangePasswordDto): Promise<IToken> {
        this.logger.info('[CHANGE PASSWORD], changePasswordDto', changePasswordDto);

        const { id, ...restDto } = changePasswordDto;

        const user = await this._getUserById(id);
        if (!user) {
            throw new CustomException({
                message: UserError.USER_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        if (restDto.newPassword !== restDto.confirmPassword) {
            throw new CustomException({
                message: UserError.CONFIRM_PASSWORD_NOT_MATCH,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        const match = await this.passwordService.comparePassword(restDto.oldPassword, user.password);
        if (!match) {
            throw new CustomException({
                message: UserError.PASSWORD_NOT_CORRECT,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        const newPassword = await this.passwordService.encodePassword(restDto.newPassword);

        // Update password
        await this._updateUser({ _id: user._id }, { password: newPassword });

        // Delete auth user
        const authUsers = await this.authUserService.findAllByUserId(id);

        for (const authUser of authUsers) {
            await Promise.all([
                this.redisService.del(`accessToken:${authUser.sessionId}`),
                this.redisService.del(`refreshToken:${authUser.sessionId}`),
            ]);
        }

        await this.authUserService.deleteByUserId(id);

        // Generate Token
        return await this.tokenService.generateUserToken(user);
    }

    // [PUT] /users/info
    async updateInfo(updateInfoDto: UpdateInfoDto): Promise<boolean> {
        this.logger.info('[UPDATE USER], updateInfoDto', updateInfoDto);

        const { id, ...restDto } = updateInfoDto;

        const user = await this._getUserById(id);
        if (!user) {
            throw new CustomException({
                message: UserError.USER_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Check existed attribute
        const [checkUsername, checkMail, checkPhone] = await Promise.all([
            this._getUserForValidate({ username: updateInfoDto.username }, id),
            this._getUserForValidate({ emial: updateInfoDto.email }, id),
            this._getUserForValidate({ phoneNumber: updateInfoDto.phoneNumber }, id),
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

        return this._updateUser({ _id: id }, restDto);
    }

    // [GET] /users/info
    // [GET] /users/:id
    async getUser(id: string): Promise<UserInfoResponseDataDto> {
        this.logger.info('[GET USER BY ID] id', id);

        const user = await this.userRepository.findById(id, null, {
            populate: 'job',
        });

        if (!user) {
            throw new CustomException({
                message: UserError.USER_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        return user;
    }

    // [GET] /users
    async getUserList(): Promise<UserInfoResponseDataDto[]> {
        this.logger.info('[GET USER LIST]');

        return this._getUserList();
    }

    // ============================ START COMMON FUNCTION ============================
    async _removeJob(jobId: string): Promise<void> {
        await this.userRepository.updateMany({ job: jobId }, { job: null });
    }

    async _restoreUser(id: string): Promise<boolean> {
        await this.userRepository.updateOne({ _id: id }, { deleted: false });

        return true;
    }

    async _getDeletedUser(id: string): Promise<User> {
        return this.userRepository.findOne({ _id: id, deleted: true });
    }

    async _softDeleteUser(id: string): Promise<boolean> {
        await this.userRepository.updateOne({ _id: id }, { deleted: true });

        return true;
    }

    async _updateManyUser(ids: string[], update: User | any): Promise<UpdateWriteOpResult> {
        return this.userRepository.updateMany({ _id: { $in: ids } }, update);
    }

    async _updateUser(filter: FilterQuery<User>, update: User | any): Promise<boolean> {
        const result = await this.userRepository.updateOne(filter, update);
        if (result.modifiedCount !== 1) {
            throw new CustomException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: CommonError.SOMETHING_WRONG_WHEN_UPDATE,
            });
        }

        return true;
    }

    async _createUser(doc: User | any): Promise<User> {
        return this.userRepository.create(doc);
    }

    async _getUserForValidate(filter: FilterQuery<User>, exceptId?: string): Promise<User> {
        const query = exceptId ? { _id: { $ne: exceptId }, ...filter } : { ...filter };

        return this.userRepository.findOne(query);
    }

    async _getUserById(id: string): Promise<User> {
        return this.userRepository.findById(id);
    }

    async _getUserList(filter?: FilterQuery<User>): Promise<User[]> {
        return this.userRepository.findAll({ ...filter }, null, { populate: 'job' });
    }

    // ============================ END COMMON FUNCTION ============================
}

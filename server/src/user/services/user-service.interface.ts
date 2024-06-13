import { IToken } from '@/auth-user/interfaces/token.interface';
import { ChangePasswordDto } from '../dtos/request/change-password.dto';
import { User } from '../schemas/user.schema';
import { UpdateInfoDto } from '../dtos/request/update-info.dto';
import { UserInfoResponseDataDto } from '../dtos/response/user-info-response.dto';
import { FilterQuery, UpdateWriteOpResult } from 'mongoose';

export interface IUserService {
    changePassword(changePasswordDto: ChangePasswordDto): Promise<IToken>;
    updateInfo(updateInfoDto: UpdateInfoDto): Promise<boolean>;
    getUser(id: string): Promise<UserInfoResponseDataDto>;
    getUserList(): Promise<UserInfoResponseDataDto[]>;

    // ============================ START COMMON FUNCTION ============================
    _removeJob(jobId: string): Promise<void>;
    _restoreUser(id: string): Promise<boolean>;
    _getDeletedUser(id: string): Promise<User>;
    _softDeleteUser(id: string): Promise<boolean>;
    _updateManyUser(ids: string[], update: User | any): Promise<UpdateWriteOpResult>;
    _updateUser(filter: FilterQuery<User>, update: User | any): Promise<boolean>;
    _createUser(doc: User | any): Promise<User>;
    _getUserForValidate(filter: FilterQuery<User>, exceptId?: string): Promise<User>;
    _getUserById(id: string): Promise<User>;
    _getUserList(filter?: FilterQuery<User>): Promise<User[]>;
    // ============================ END COMMON FUNCTION ============================
}

export const IUserService = Symbol('IUserService');

import { CreateUserDto } from '../dtos/request/create-user.dto';
import { UpdateUserDto } from '../dtos/request/update-user.dto';
import { DeleteUserDto } from '../dtos/request/delete-user.dto';
import { RestoreUserDto } from '../dtos/request/restore-user.dto';
import { UserInfoResponseDataDto } from '@/user/dtos/response/user-info-response.dto';

export interface IAdminService {
    restoreUser(restoreUserDto: RestoreUserDto): Promise<boolean>;
    deleteUser(deleteUserDto: DeleteUserDto): Promise<boolean>;
    updateUser(updateUserDto: UpdateUserDto): Promise<boolean>;
    createUser(createUserDto: CreateUserDto): Promise<UserInfoResponseDataDto>;
}

export const IAdminService = Symbol('IAdminService');

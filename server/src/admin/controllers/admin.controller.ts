import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { IAdminService } from '../services/admin-service.interface';
import { BadRequestResponseDto } from '@/shared/dtos/response/bad-request-response.dto';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { CreateUserDto } from '../dtos/request/create-user.dto';
import { CreateUserResponseDto } from '../dtos/response/create-user-response.dto';
import { UpdateUserDto } from '../dtos/request/update-user.dto';
import { BooleanResponseDto } from '@/shared/dtos/response/boolean-response.dto';
import { RolesGuard } from '@/shared/guards/role.guard';
import { Roles } from '@/shared/decorators/role.decorator';
import { DeleteUserDto } from '../dtos/request/delete-user.dto';
import { RestoreUserDto } from '../dtos/request/restore-user.dto';

@Controller('admin')
export class AdminController {
    constructor(@Inject(IAdminService) private readonly adminService: IAdminService) {}

    // [POST] /admin/restore-user
    @Roles('admin')
    @UseGuards(RolesGuard)
    @Post('restore-user')
    @ApiOperation({ summary: 'Admin Restore User.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async restoreUser(@Body() restoreUserDto: RestoreUserDto): Promise<BooleanResponseDto> {
        const result = await this.adminService.restoreUser(restoreUserDto);

        return new BooleanResponseDto(result);
    }

    // [POST] /admin/delete-user
    @Roles('admin')
    @UseGuards(RolesGuard)
    @Post('delete-user')
    @ApiOperation({ summary: 'Admin Delete User.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async deleteUser(@Body() deleteUserDto: DeleteUserDto): Promise<BooleanResponseDto> {
        const result = await this.adminService.deleteUser(deleteUserDto);

        return new BooleanResponseDto(result);
    }

    // [POST] /admin/update-user
    @Roles('admin')
    @UseGuards(RolesGuard)
    @Post('update-user')
    @ApiOperation({ summary: 'Admin Update User.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async updateUser(@Body() updateUserDto: UpdateUserDto): Promise<BooleanResponseDto> {
        const result = await this.adminService.updateUser(updateUserDto);

        return new BooleanResponseDto(result);
    }

    // [POST] /admin/create-user
    @Roles('admin')
    @UseGuards(RolesGuard)
    @Post('create-user')
    @ApiOperation({ summary: 'Admin Create User.' })
    @ApiOkResponse({ type: CreateUserResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
        const result = await this.adminService.createUser(createUserDto);

        return new CreateUserResponseDto(result);
    }
}

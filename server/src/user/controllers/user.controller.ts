import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Put } from '@nestjs/common';
import { IUserService } from '../services/user-service.interface';
import { UserInfoResponseDto } from '../dtos/response/user-info-response.dto';
import { BadRequestResponseDto } from '@/shared/dtos/response/bad-request-response.dto';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AuthDto } from '@/shared/dtos/auth/auth.dto';
import GetAuthUser from '@/shared/decorators/get-auth-user.decorator';
import { UserListResponseDto } from '../dtos/response/user-list-response.dto';
import { ChangePasswordDto } from '../dtos/request/change-password.dto';
import { ChangePasswordResponseDto } from '../dtos/response/change-password-response.dto';
import { UpdateInfoDto } from '../dtos/request/update-info.dto';
import { BooleanResponseDto } from '@/shared/dtos/response/boolean-response.dto';

@Controller('users')
export class UserController {
    constructor(@Inject(IUserService) private readonly userService: IUserService) {}

    // [PUT] /users/change-password
    @Put('change-password')
    @ApiOperation({ summary: 'Change Password.' })
    @ApiOkResponse({ type: ChangePasswordResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async changePassword(
        @GetAuthUser() authDto: AuthDto,
        @Body() changePasswordDto: ChangePasswordDto,
    ): Promise<ChangePasswordResponseDto> {
        changePasswordDto.id = authDto._id;
        const result = await this.userService.changePassword(changePasswordDto);

        return new ChangePasswordResponseDto(result);
    }

    // [PUT] /users/info
    @Put('info')
    @ApiOperation({ summary: 'Update User Info.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async updateInfo(
        @GetAuthUser() authDto: AuthDto,
        @Body() updateInfoDto: UpdateInfoDto,
    ): Promise<BooleanResponseDto> {
        updateInfoDto.id = authDto._id;
        const result = await this.userService.updateInfo(updateInfoDto);

        return new BooleanResponseDto(result);
    }

    // [GET] /users/info
    @Get('info')
    @ApiOperation({ summary: 'Get User Info.' })
    @ApiOkResponse({ type: UserInfoResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getUserInfo(@GetAuthUser() authDto: AuthDto): Promise<UserInfoResponseDto> {
        const result = await this.userService.getUser(authDto._id);

        return new UserInfoResponseDto(result);
    }

    // [GET] /users/:id
    @Get(':id')
    @ApiOperation({ summary: 'Get User Info.' })
    @ApiOkResponse({ type: UserInfoResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getUser(@Param('id') id: string): Promise<UserInfoResponseDto> {
        const result = await this.userService.getUser(id);

        return new UserInfoResponseDto(result);
    }

    // [GET] /users
    @Get()
    @ApiOperation({ summary: 'Get User List.' })
    @ApiOkResponse({ type: UserListResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getUserList(): Promise<UserListResponseDto> {
        const result = await this.userService.getUserList();

        return new UserListResponseDto(result);
    }
}

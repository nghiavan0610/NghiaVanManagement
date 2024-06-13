import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { IAuthService } from '../services/auth-service.interface';
import { SigninDto } from '../dtos/request/signin.dto';
import { SigninResponseDto } from '../dtos/response/signin-response.dto';
import { Public } from '@/shared/decorators/is-public.decorator';
import { BadRequestResponseDto } from '@/shared/dtos/response/bad-request-response.dto';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { BooleanResponseDto } from '@/shared/dtos/response/boolean-response.dto';
import { AuthDto } from '@/shared/dtos/auth/auth.dto';
import GetAuthUser from '@/shared/decorators/get-auth-user.decorator';
import { RefreshTokenGuard } from '@/shared/guards/refresh-token.guard';
import { RefreshTokenResponseDto } from '../dtos/response/refresh-token-response.dto';

@Controller('auth')
export class AuthController {
    constructor(@Inject(IAuthService) private readonly authService: IAuthService) {}

    @Public()
    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    @ApiOperation({ summary: 'Refresh Token.' })
    @ApiOkResponse({ type: RefreshTokenResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async refreshToken(@GetAuthUser() authDto: AuthDto): Promise<RefreshTokenResponseDto> {
        const result = await this.authService.refreshToken(authDto);

        return new RefreshTokenResponseDto(result);
    }

    @Get('signout')
    @ApiOperation({ summary: 'Signout account.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async signout(@GetAuthUser() authDto: AuthDto): Promise<BooleanResponseDto> {
        await this.authService.signout(authDto);

        return new BooleanResponseDto(true);
    }

    @Public()
    @Post('signin')
    @ApiOperation({ summary: 'Signin account.' })
    @ApiOkResponse({ type: SigninResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async signin(@Body() signinDto: SigninDto): Promise<SigninResponseDto> {
        const result = await this.authService.signin(signinDto);

        return new SigninResponseDto(result);
    }
}

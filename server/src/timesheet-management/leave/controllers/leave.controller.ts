import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query } from '@nestjs/common';
import { ILeaveService } from '../services/leave-service.interface';
import GetAuthUser from '@/shared/decorators/get-auth-user.decorator';
import { AuthDto } from '@/shared/dtos/auth/auth.dto';
import { BadRequestResponseDto } from '@/shared/dtos/response/bad-request-response.dto';
import { BooleanResponseDto } from '@/shared/dtos/response/boolean-response.dto';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { RequestLeaveDto } from '../dtos/request/request-leave.dto';
import { LeaveListResponseDto } from '../dtos/response/leave-list-response.dto';
import { GetLeaveListDto } from '../dtos/request/get-leave-list.dto';
import { LeaveDetailResponseDto } from '../dtos/response/leave-detail-response.dto';

@Controller('leaves')
export class LeaveController {
    constructor(@Inject(ILeaveService) private readonly leaveService: ILeaveService) {}

    // [GET] /leaves/:id
    @Get(':id')
    @ApiOperation({ summary: 'Get Leave Detail By Id' })
    @ApiOkResponse({ type: LeaveDetailResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getLeaveDetail(@Param('id') id: string): Promise<LeaveDetailResponseDto> {
        const result = await this.leaveService.getLeaveDetail(id);

        return new LeaveDetailResponseDto(result);
    }

    // [GET] /leaves?month=
    @Get()
    @ApiOperation({ summary: 'Get Leave by Month' })
    @ApiOkResponse({ type: LeaveListResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getLeaveListByMonth(
        @GetAuthUser() authDto: AuthDto,
        @Query() filters: GetLeaveListDto,
    ): Promise<LeaveListResponseDto> {
        filters.userId = authDto._id;
        const result = await this.leaveService.getLeaveListByMonth(filters);

        return new LeaveListResponseDto(result);
    }

    // [POST] /leaves
    @Post()
    @ApiOperation({ summary: 'Request Leave.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.CREATED)
    async requestLeave(
        @GetAuthUser() authDto: AuthDto,
        @Body() requestLeaveDto: RequestLeaveDto,
    ): Promise<BooleanResponseDto> {
        requestLeaveDto.userId = authDto._id;
        const result = await this.leaveService.requestLeave(requestLeaveDto);

        return new BooleanResponseDto(result);
    }
}

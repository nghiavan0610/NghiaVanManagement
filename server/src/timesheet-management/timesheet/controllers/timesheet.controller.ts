import { Controller, Get, HttpCode, HttpStatus, Inject, Query } from '@nestjs/common';
import { ITimesheetService } from '../services/timesheet-service.interface';
import { BadRequestResponseDto } from '@/shared/dtos/response/bad-request-response.dto';
import { GetTimesheetProjectListByMonthDto } from '@/timesheet-management/timesheet-project/dtos/request/get-timesheet-project-list-by-month.dto';
import { TimesheetProjectListResponseDto } from '@/timesheet-management/timesheet-project/dtos/response/timesheet-project-list-response.dto';
import { TimesheetUserListResponseDto } from '@/timesheet-management/timesheet-user/dtos/response/timesheet-user-list-response.dto';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { GetTimesheetUserListByMonthDto } from '@/timesheet-management/timesheet-user/dtos/request/get-timesheet-user-list-by-month.dto';

@Controller('timesheets')
export class TimesheetController {
    constructor(@Inject(ITimesheetService) private readonly timesheetService: ITimesheetService) {}

    // [GET] /timesheets/user?month=
    @Get('user')
    @ApiOperation({ summary: 'Get Timesheet User List by Month' })
    @ApiOkResponse({ type: TimesheetUserListResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getTimesheetUserListByMonth(
        @Query() filters: GetTimesheetUserListByMonthDto,
    ): Promise<TimesheetUserListResponseDto> {
        const result = await this.timesheetService.getTimesheetUserListByMonth(filters);

        return new TimesheetUserListResponseDto(result);
    }

    // [GET] /timesheets/project?projectId=&month=
    @Get('project')
    @ApiOperation({ summary: 'Get Timesheet Project List by Month' })
    @ApiOkResponse({ type: TimesheetProjectListResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getTimesheetProjectListByMonth(
        @Query() filters: GetTimesheetProjectListByMonthDto,
    ): Promise<TimesheetProjectListResponseDto> {
        const result = await this.timesheetService.getTimesheetProjectListByMonth(filters);

        return new TimesheetProjectListResponseDto(result);
    }
}

import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, Res } from '@nestjs/common';
import { IExportService } from '../services/export-service.interface';
import { Response } from 'express';
import { ExportTimesheetProjectDto } from '../dtos/request/export-timesheet-project.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ExportSummaryDto } from '../dtos/request/export-summary.dto';
import { ExportReportDto } from '../dtos/request/export-report.dto';
import { ExportTimesheetUserDto } from '../dtos/request/export-timesheet-user.dto';

@Controller('export')
export class ExportController {
    constructor(@Inject(IExportService) private readonly exportService: IExportService) {}

    // [POST] /export/report
    @Post('report')
    @ApiOperation({ summary: `Export Project Report.` })
    @HttpCode(HttpStatus.OK)
    async exportReport(@Body() filters: ExportReportDto, @Res() res: Response): Promise<void> {
        const result = await this.exportService.exportReport(filters);

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}`);

        res.send(Buffer.from(result.buffer));
    }

    // [GET] /export/summary?projectId=
    @Get('summary')
    @ApiOperation({ summary: `Export Project Summary.` })
    @HttpCode(HttpStatus.OK)
    async exportSummary(@Query() filters: ExportSummaryDto, @Res() res: Response): Promise<void> {
        const result = await this.exportService.exportSummary(filters);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}`);

        res.send(Buffer.from(result.buffer));
    }

    // [GET] /export/timesheet-project?projectId=&month=
    @Get('timesheet-project')
    @ApiOperation({ summary: `Export Timesheet Project By Month.` })
    @HttpCode(HttpStatus.OK)
    async exportTimesheetProject(@Query() filters: ExportTimesheetProjectDto, @Res() res: Response): Promise<void> {
        const result = await this.exportService.exportTimesheetProject(filters);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}`);

        res.send(Buffer.from(result.buffer));
    }

    // [GET] /export/timesheet-user?month=
    @Get('timesheet-user')
    @ApiOperation({ summary: `Export Timesheet USer By Month.` })
    @HttpCode(HttpStatus.OK)
    async exportTimesheetUSer(@Query() filters: ExportTimesheetUserDto, @Res() res: Response): Promise<void> {
        const result = await this.exportService.exportTimesheetUSer(filters);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}`);

        res.send(Buffer.from(result.buffer));
    }
}

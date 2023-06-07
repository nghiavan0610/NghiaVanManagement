const { ApiError } = require('../../helpers/ErrorHandler');
const { User, Project, Job, Timesheet, TimesheetDetail } = require('../../db/models');
const { removeS3 } = require('../../middlewares/S3Middleware');
const config = require('../../configs/env');
const excel = require('excel4node');
const projectService = require('./ProjectService');

class TimesheetService {
    // [GET] /v1/projects/:projectSlug/timesheet
    async getTimesheet(projectSlug) {
        try {
            const project = await Project.findOne({ slug: projectSlug })
                .select('_id name code deleted location description slug')
                .populate({
                    path: 'timesheets',
                    populate: [
                        { path: 'manager', select: '_id name' },
                        { path: 'members', select: '_id name' },
                        { path: 'timesheetDetails', populate: { path: 'leavers', select: '_id name' } },
                    ],
                })
                .lean()
                .exec();
            if (!project) throw new ApiError(404, `Porject was not found: ${projectSlug}`);
            if (project.deleted) throw new ApiError(406, `Project has been disabled`);

            return project;
        } catch (err) {
            throw err;
        }
    }

    // [POST] /v1/projects/:projectSlug/timesheet/upload-file
    async uploadFile(authUser, projectSlug, formData, files) {
        try {
            const { workDate, shift } = formData;

            const project = await projectService.getLeanProject(projectSlug);

            if (
                !project.manager.equals(authUser._id) &&
                !project.leaders.some((leader) => leader.equals(authUser.id)) &&
                !project.members.some((member) => member.equals(authUser._id))
            ) {
                throw new ApiError(403, 'You do not have permission to edit this timesheet');
            }

            // workDate isn't more than 10 days
            const tenDaysAgo = new Date().getTime() - 10 * 24 * 60 * 60 * 1000;
            if (
                new Date(workDate).getTime() < tenDaysAgo &&
                !project.manager.equals(authUser._id) &&
                authUser.role !== 'admin'
            ) {
                throw new ApiError(403, 'You are 10 days late. Please contact the project manager');
            }

            const monthYear = workDate.slice(0, 7);
            let timesheet = await Timesheet.findOne({ project: project._id, monthYear }).lean().exec();

            if (!timesheet) {
                timesheet = await Timesheet.create({
                    project: project._id,
                    manager: project.manager,
                    members: [...project.leaders, ...project.members],
                    startedAt: project.startedAt,
                    monthYear,
                });

                await Project.updateOne({ _id: project._id }, { $push: { timesheets: timesheet._id } });
            }

            const [timesheetDetail, proofs] = await Promise.all([
                TimesheetDetail.findOneAndUpdate(
                    { timesheet: timesheet._id, workDate, shift },
                    { $setOnInsert: { timesheet: timesheet._id, workDate, shift } },
                    { upsert: true, new: true },
                ).exec(),
                files.map((file) => ({
                    proofName: file.originalname,
                    proofUri: file.location,
                    isApproved: false,
                })),
            ]);

            timesheetDetail.proofs.push(...proofs);
            await timesheetDetail.save();

            const timesheetDetailIndex = timesheet.timesheetDetails.findIndex(
                (tsDetail) => tsDetail._id.toString() === timesheetDetail._id.toString(),
            );

            if (timesheetDetailIndex === -1) {
                await Timesheet.updateOne({ _id: timesheet._id }, { $push: { timesheetDetails: timesheetDetail._id } });
            }

            return timesheetDetail;
        } catch (err) {
            throw err;
        }
    }

    // [DELETE] /v1/projects/:projectSlug/timesheet/delete-file
    async deleteFile(authUser, formData) {
        try {
            const { timesheetDetailId, proofId } = formData;

            const timesheetDetail = await TimesheetDetail.findOne(
                { _id: timesheetDetailId, 'proofs._id': proofId },
                { 'proofs.$': 1 },
            )
                .populate('timesheet', 'manager members')
                .lean()
                .exec();

            if (!timesheetDetail) throw new ApiError(404, `TimesheetDetail or Document was not found`);

            if (
                !['admin'].includes(authUser.role) &&
                !timesheetDetail.timesheet.manager.equals(authUser._id) &&
                !timesheetDetail.timesheet.members.some((member) => member.equals(authUser._id))
            ) {
                throw new ApiError(403, 'You do not have persmission to edit this timesheet');
            }

            const proofKey = timesheetDetail.proofs[0].proofUri.split(`${config.S3_BUCKET}/`)[1];
            if (proofKey) await removeS3(proofKey);

            await TimesheetDetail.updateOne({ _id: timesheetDetailId }, { $pull: { proofs: { _id: proofId } } });
        } catch (err) {
            throw err;
        }
    }

    // [PUT] /v1/projects/:projectSlug/timesheet/review
    async reviewTimesheet(authUser, projectSlug, formData) {
        try {
            const { workDate, shift, comment, proofId, isApproved } = formData;

            const project = await projectService.getLeanProject(projectSlug);

            if (!project) throw new ApiError(404, `Porject was not found: ${projectSlug}`);

            if (
                !['admin'].includes(authUser.role) &&
                !project.manager.equals(authUser.id) &&
                !project.leaders.some((leader) => leader.equals(authUser.id))
            ) {
                throw new ApiError(403, 'You do not have permission to edit this timeheet.');
            }

            const monthYear = workDate.slice(0, 7);
            let timesheet = await Timesheet.findOne({ project: project._id, monthYear }).lean().exec();

            if (!timesheet) {
                timesheet = await Timesheet.create({
                    project: project._id,
                    manager: project.manager,
                    members: [...project.leaders, ...project.members],
                    startedAt: project.startedAt,
                    monthYear,
                });

                await Project.updateOne({ _id: project._id }, { $push: { timesheets: timesheet._id } });
            }

            let timesheetDetail = await TimesheetDetail.findOne({ timesheet: timesheet._id, workDate, shift }).exec();

            if (!timesheetDetail && comment) {
                timesheetDetail = await TimesheetDetail.create({ timesheet: timesheet._id, workDate, shift });

                await Timesheet.updateOne({ _id: timesheet._id }, { $push: { timesheetDetails: timesheetDetail._id } });
            }
            timesheetDetail.comment = comment;

            if (proofId) {
                const proofIndex = timesheetDetail.proofs.findIndex((proof) => proof._id.toString() === proofId);
                if (proofIndex === -1) throw new ApiError(404, `Document was not found: ${proofId}`);
                timesheetDetail.proofs[proofIndex].isApproved = isApproved;
            }

            await timesheetDetail.save();
            return timesheetDetail;
        } catch (err) {
            throw err;
        }
    }

    // [PUT] /v1/projects/:projectSlug/timesheet/leave-members
    async leaveMembersTimesheet(authUser, projectSlug, formData) {
        try {
            const { timesheetDetailId, members } = formData;

            const [project, timesheetDetail] = await Promise.all([
                projectService.getLeanProject(projectSlug),
                TimesheetDetail.findById(timesheetDetailId).exec(),
            ]);

            if (!project) throw new ApiError(404, `Project was not found: ${projectSlug}`);

            if (
                !['admin'].includes(authUser.role) &&
                !project.manager.equals(authUser.id) &&
                !project.leaders.some((leader) => leader.equals(authUser.id))
            ) {
                throw new ApiError(403, 'You do not have permission to edit this timesheet');
            }

            const memberNotExists = members.filter(
                (memberID) =>
                    ![project.manager, ...project.leaders, ...project.members].some((id) => id.equals(memberID)),
            );

            if (memberNotExists.length > 0) {
                throw new ApiError(406, `User not in this project: ${memberNotExists}`);
            }

            timesheetDetail.leavers = members;
            await timesheetDetail.save();

            return timesheetDetail;
        } catch (err) {
            throw err;
        }
    }

    // [POST] /v1/projects/:projectSlug/timesheet/download
    async downloadTimesheet(authUser, formData) {
        try {
            const { timesheetId } = formData;
            const timesheet = await Timesheet.findById(timesheetId)
                .populate([
                    { path: 'manager', select: '_id name' },
                    { path: 'members', select: '_id name' },
                    { path: 'timesheetDetails' },
                ])
                .lean()
                .exec();
            if (!timesheet) throw new ApiError(404, `Timesheet was not found: ${timesheetId}`);
            if (!timesheet.timesheetDetail === 0)
                throw new ApiError(404, `Project does not have a timesheet ${timesheet.monthYear}`);

            if (authUser.role !== 'admin' && !timesheet.manager.equals(authUser.id)) {
                throw new ApiError(403, 'You do not have permission to download this timesheet');
            }

            const workbook = new excel.Workbook({
                defaultFont: { size: 11, name: 'Times New Roman', color: '#000000' },
            });

            const titleStyle = workbook.createStyle({
                font: { bold: true },
                alignment: { wrapText: false, horizontal: 'center', vertical: 'center' },
            });
            const style = workbook.createStyle({
                alignment: { wrapText: true, horizontal: 'center', vertical: 'center' },
            });

            const [year, month] = timesheet.monthYear.split('-');
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            // Start
            const startRow = 6;
            const startCol = 1;
            const ws = workbook.addWorksheet('BCC');

            ws.cell(startRow - 2, startCol + 16)
                .string(`BẢNG CHẤM CÔNG THÁNG ${month}/${year}`)
                .style({ ...titleStyle, font: { ...titleStyle.font, size: 15 } });

            ws.cell(startRow, startCol, startRow + 2, startCol, true)
                .string('Mã số')
                .style(titleStyle);
            ws.cell(startRow, startCol + 1, startRow + 2, startCol + 1, true)
                .string('HỌ VÀ TÊN')
                .style(titleStyle);
            ws.column(startCol + 1).setWidth(25);
            ws.row(startRow).setHeight(30);

            let col = startCol + 2;
            let endRow;
            for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(d);
                const date = d.getDate().toString();

                ws.cell(startRow + 1, col)
                    .string(`${date}`)
                    .style(titleStyle);
                ws.cell(startRow + 2, col)
                    .string(`${dayOfWeek}`)
                    .style(titleStyle);

                const timesheetDetail = timesheet.timesheetDetails.filter(
                    (ts) => ts.workDate.getDate() === d.getDate(),
                );

                // Name column
                let row = startRow + 3;
                for (const employee of [timesheet.manager, ...timesheet.members]) {
                    if (col === startCol + 2) {
                        ws.cell(row, startCol + 1)
                            .string(`${employee.name}`)
                            .style(titleStyle);
                        ws.cell(row + 1, startCol + 1)
                            .string(`Sáng`)
                            .style(style);
                        ws.cell(row + 2, startCol + 1)
                            .string(`Chiều`)
                            .style(style);
                        ws.cell(row + 3, startCol + 1)
                            .string(`Tối`)
                            .style(style);
                        ws.cell(row + 4, startCol + 1)
                            .string(`Chờ việc`)
                            .style(style);
                        ws.cell(row + 5, startCol + 1)
                            .string(`Hỗ trợ`)
                            .style(style);
                        ws.cell(row + 6, startCol + 1)
                            .string(`Năng suất`)
                            .style(style);
                    }

                    // sum row
                    const firstSum = excel.getExcelCellRef(row + 1, col);
                    const lastSum = excel.getExcelCellRef(row + 3, col);
                    ws.cell(row, col)
                        .formula(`IF(COUNTIF(${firstSum}:${lastSum},"*P*")=0,SUM(${firstSum}:${lastSum}),"P")`)
                        .style(titleStyle);
                    row++;

                    // morning/evening row
                    if (timesheetDetail.length !== 0) {
                        const findShiftTimesheetDetail = (shift) => timesheetDetail.find((ts) => ts.shift === shift);

                        const morningTs = findShiftTimesheetDetail('morning');
                        const eveningTs = findShiftTimesheetDetail('evening');
                        const nightTs = findShiftTimesheetDetail('night');

                        const processShift = (shiftTsDt) => {
                            const allApproved = shiftTsDt.proofs.every((proof) => proof.isApproved);
                            if (allApproved) {
                                ws.cell(row, col).number(1).style(style);
                            }

                            const isLeaver = shiftTsDt.leavers.some((memberId) =>
                                memberId.equals(employee._id.toString()),
                            );
                            if (isLeaver) {
                                ws.cell(row, col).string('P').style(style);
                            }
                        };

                        if (morningTs) {
                            processShift(morningTs);
                        }
                        row++;

                        if (eveningTs) {
                            processShift(eveningTs);
                        }
                        row++;

                        if (nightTs) {
                            processShift(nightTs);
                        }
                        row++;
                    } else {
                        // wait/support/productivity row if there are no morning, evening, and night shifts
                        row += 3;
                    }

                    // wait/support/productivity row
                    row += 3;
                }
                endRow = row;
                col++;
            }

            ws.cell(startRow, startCol + 2, startRow, col - 1, true)
                .string('SỐ NGÀY TRONG THÁNG')
                .style(titleStyle);

            for (let i = startRow + 3 - 1; i < endRow - 3; i++) {
                if (i === startRow + 2) {
                    ws.cell(startRow + 2, col)
                        .string('Ntt')
                        .style(titleStyle);
                    ws.cell(startRow + 2, col + 1)
                        .string('Np')
                        .style(titleStyle);
                    ws.cell(startRow + 2, col + 2)
                        .string('Nqđ')
                        .style(titleStyle);
                    ws.cell(startRow + 2, col + 3)
                        .string('Ncv')
                        .style(titleStyle);
                    ws.cell(startRow + 2, col + 4)
                        .string('Nht')
                        .style(titleStyle);
                    ws.cell(startRow + 2, col + 5)
                        .string('Nns')
                        .style(titleStyle);
                    ws.cell(startRow + 2, col + 6)
                        .string('Ntc')
                        .style(titleStyle);
                    ws.cell(startRow + 2, col + 7)
                        .string('Nht')
                        .style(titleStyle);
                    ws.cell(startRow, col, startRow + 1, col + 7, true)
                        .string('NGÀY CÔNG')
                        .style(titleStyle);
                    ws.cell(startRow, col + 8, startRow + 2, col + 8, true)
                        .string('KÝ NHẬN')
                        .style(titleStyle);
                    ws.cell(startRow, col + 9, startRow + 2, col + 9, true)
                        .string('CHE')
                        .style(titleStyle);
                    continue;
                }

                // Ntt col
                const firstNtt = excel.getExcelCellRef(i, startCol + 2);
                const lastNtt = excel.getExcelCellRef(i, col - 1);
                ws.cell(i, col).formula(`SUM(${firstNtt}:${lastNtt})/2`).style(titleStyle);

                // Np col
                ws.cell(i, col + 1)
                    .formula(`COUNTIF(${firstNtt}:${lastNtt},"=P")`)
                    .style(titleStyle);

                // Nqd col
                const firstNqd = excel.getExcelCellRef(i, col - 2);
                const lastNqd = excel.getExcelCellRef(i, col - 1);
                ws.cell(i, col + 2)
                    .formula(`IF((${firstNqd} + ${lastNqd}) > 26,26 - ${lastNqd},${firstNqd})`)
                    .style(titleStyle);

                // Ncv col
                const firstNcv = excel.getExcelCellRef(i + 4, startCol + 2);
                const lastNcv = excel.getExcelCellRef(i + 4, col - 1);
                ws.cell(i, col + 3)
                    .formula(`SUM(${firstNcv}:${lastNcv})/2`)
                    .style(titleStyle);

                // Nht col
                // Nns col
                // Ntc col
                const nttRow = excel.getExcelCellRef(i, col);
                const npRow = excel.getExcelCellRef(i, col + 1);
                ws.cell(i, col + 6)
                    .formula(`SUM(${nttRow}:${npRow})`)
                    .style(titleStyle);

                // Nht col
                const nqdRow = excel.getExcelCellRef(i, col + 2);
                ws.cell(i, col + 7)
                    .formula(`IF(OR(${nttRow}<>0,${npRow}<>0,${nqdRow}<>0),1,0)`)
                    .style(titleStyle);
                i += 6;
            }

            // Sign col
            const today = new Date();
            ws.cell(endRow + 3, startCol + 7)
                .string('PHỤ TRÁCH BỘ PHẬN')
                .style(titleStyle);
            ws.cell(endRow + 3, startCol + 21)
                .string('NGƯỜI KIỂM TRA')
                .style(titleStyle);
            ws.cell(endRow + 2, startCol + 33)
                .string(
                    `Ngày ${today.getDate().toString()} tháng ${today.getMonth().toString()} năm ${today
                        .getFullYear()
                        .toString()}`,
                )
                .style({ ...style, alignment: { ...style.alignment, wrapText: false } });
            ws.cell(endRow + 3, startCol + 33)
                .string('NGƯỜI CHẤM CÔNG')
                .style(titleStyle);

            ws.cell(startRow, startCol, endRow - 1, col + 9).style({
                border: {
                    left: { style: 'thin', color: 'black' },
                    right: { style: 'thin', color: 'black' },
                    top: { style: 'thin', color: 'black' },
                    bottom: { style: 'thin', color: 'black' },
                },
            });

            return workbook;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new TimesheetService();

const mongoose = require('mongoose');
const { ApiError } = require('../../helpers/ErrorHandler');
const populateProject = require('../../helpers/PopulateProject');
const { User, Project, Job, Summary, Tru, BoChang, Mong } = require('../../db/models');
const excel = require('excel4node');
const xlsx = require('xlsx');
const models = require('../../db/models');
const { getS3 } = require('../../middlewares/S3Middleware');
const projectService = require('./ProjectService');

const types = [
    { dayDans: { modelName: 'DayDan', vnName: 'Dây dẫn' } },
    { trus: { modelName: 'Tru', vnName: 'Trụ' } },
    { mongs: { modelName: 'Mong', vnName: 'Móng' } },
    { das: { modelName: 'Da', vnName: 'Đà' } },
    { boChangs: { modelName: 'BoChang', vnName: 'Chằng' } },
    { tiepDias: { modelName: 'TiepDia', vnName: 'Tiếp địa' } },
    { xaSus: { modelName: 'XaSu', vnName: 'Xà sứ' } },
    { phuKiens: { modelName: 'PhuKien', vnName: 'Phụ kiện' } },
    { thietBis: { modelName: 'ThietBi', vnName: 'Thiết bị' } },
];

const startCol = 1;
const materialStartCol = startCol + 6;
class SummaryService {
    // [POST] /v1/projects/:projectSlug/summary
    async handleSummary(authUser, projectSlug, formData) {
        try {
            const { isOriginal } = formData;
            const project = await Project.findOne({ slug: projectSlug }).select('_id manager leaders members').exec();
            if (!project) throw new ApiError(404, `Project was not found: ${projectSlug}`);

            if (
                authUser.role !== 'admin' &&
                !project.manager.equals(authUser.id) &&
                !project.leaders.some((leader) => leader.equals(authUser.id)) &&
                !project.members.some((member) => member.equals(authUser.id))
            ) {
                throw new ApiError(403, 'You do not have permission to access this project');
            }

            const summary = await Summary.findOneAndUpdate({ project: project._id, isOriginal: isOriginal }, formData, {
                upsert: true,
                runValidators: true,
                new: true,
            }).exec();

            if (isOriginal) {
                project.originalSummary = summary._id;

                const updatedSummary = await new Summary(summary.toObject());
                updatedSummary._id = mongoose.Types.ObjectId();
                updatedSummary.isOriginal = false;
                await updatedSummary.save();

                project.updatedSummary = updatedSummary._id;
            }
            await project.save();
            return summary;
        } catch (err) {
            throw err;
        }
    }

    // [POST] /v1/projects/:projectSlug/summary/download
    async downloadSummary(authUser, projectSlug) {
        try {
            const project = await Project.findOne({ slug: projectSlug })
                .populate(populateProject('updatedSummary'))
                .lean()
                .exec();
            if (!project) throw new ApiError(404, `Không tìm thấy dự án: ${projectSlug}`);
            if (project.deleted) throw new ApiError(406, `Dự án này đã bị vô hiệu hóa`);

            if (
                authUser.role !== 'admin' &&
                !project.manager.equals(authUser.id) &&
                !project.leaders.some((leader) => leader.equals(authUser.id)) &&
                !project.members.some((member) => member.equals(authUser.id))
            ) {
                throw new ApiError(403, 'Bạn không có quyền truy cập vào tổng kê của dự án này');
            }

            const workbook = new excel.Workbook({
                defaultFont: { size: 11, name: 'Times New Roman', color: '#000000' },
            });

            // Styles
            const rotateStyle = workbook.createStyle({
                alignment: { wrapText: false, horizontal: 'center', textRotation: 90, vertical: 'bottom' },
                border: {
                    left: { style: 'thin', color: 'black' },
                    right: { style: 'thin', color: 'black' },
                    top: { style: 'thin', color: 'black' },
                    bottom: { style: 'thin', color: 'black' },
                },
            });
            const titleStyle = workbook.createStyle({
                font: { bold: true },
                alignment: { wrapText: true, horizontal: 'center', vertical: 'center' },
                border: {
                    left: { style: 'thin', color: 'black' },
                    right: { style: 'thin', color: 'black' },
                    top: { style: 'thin', color: 'black' },
                    bottom: { style: 'thin', color: 'black' },
                },
            });
            const style = workbook.createStyle({
                alignment: { wrapText: true, horizontal: 'center', vertical: 'center' },
            });

            // Start
            const startRow = 6;
            const ws = workbook.addWorksheet('Tong Ke');

            ws.cell(startRow, startCol, startRow + 2, startCol, true)
                .string('Số trụ TK')
                .style(rotateStyle);
            ws.cell(startRow, startCol + 1, startRow + 2, startCol + 1, true)
                .string('Số trụ Hoàn công')
                .style(rotateStyle);
            ws.cell(startRow, startCol + 2, startRow + 2, startCol + 2, true)
                .string('Khoảng cách (m)')
                .style(rotateStyle);
            ws.cell(startRow, startCol + 3, startRow + 2, startCol + 3, true)
                .string('Cộng dồn (m)')
                .style(rotateStyle);
            ws.cell(startRow, startCol + 4, startRow + 2, startCol + 4, true)
                .string('Khoảng néo (m)')
                .style(rotateStyle);
            ws.cell(startRow, startCol + 5, startRow + 2, startCol + 5, true)
                .string('Hình thức trụ')
                .style(rotateStyle);
            // ws.cell(1, 3, 1, 4, true).string('Đường dây').style(style);
            // ws.cell(2, 3).string('Trung thế').style(style);
            // ws.cell(2, 4).string('Hạ thế').style(style);
            // ws.column(startCol + 5).freeze();

            let row = startRow + 3;
            let endCol;
            const isReassembledArr = {};
            const isRecalledArr = {};
            const descriptionArr = [];

            for (const { name, stations } of project.updatedSummary.routes) {
                const routeStartRow = row;
                row++;

                for (const { name, pillars } of stations) {
                    const stationStartRow = row;
                    // let isReassembledCol;
                    row++;

                    for (const {
                        name,
                        distance,
                        completion,
                        neoDistance,
                        shape,
                        description,
                        ...materials
                    } of pillars) {
                        // pillar rows
                        ws.cell(row, startCol).string(name).style(style);
                        if (completion)
                            ws.cell(row, startCol + 1)
                                .string(completion)
                                .style(style);
                        if (distance) {
                            ws.cell(row, startCol + 2)
                                .number(distance)
                                .style(style);

                            const leftCell = excel.getExcelCellRef(row, startCol + 2);
                            const aboveCell = excel.getExcelCellRef(row - 1, startCol + 3);
                            ws.cell(row, startCol + 3)
                                .formula(`${leftCell} + ${aboveCell}`)
                                .style(style);
                        }
                        if (neoDistance)
                            ws.cell(row, startCol + 4)
                                .number(neoDistance)
                                .style(style);
                        if (shape)
                            ws.cell(row, startCol + 5)
                                .string(shape)
                                .style(style);

                        if (description) {
                            descriptionArr.push({ row, content: description });
                        }

                        let isNewCol = materialStartCol;

                        for (const type of types) {
                            const isNewStartCol = isNewCol;
                            // Filter out isReassembled and isRecalled materials
                            const filteredMaterials = materials[Object.keys(type)].filter(
                                (material) => !material.isReassembled && !material.isRecalled,
                            );

                            for (const {
                                detail: { name },
                                quantity,
                                comment,
                                isDone,
                                isReassembled,
                                isRecalled,
                            } of materials[Object.keys(type)]) {
                                // Store isReassembled
                                if (isReassembled) {
                                    if (!isReassembledArr[Object.values(type)[0].vnName]) {
                                        isReassembledArr[Object.values(type)[0].vnName] = {};
                                    }

                                    if (!isReassembledArr[Object.values(type)[0].vnName][`${name}`]) {
                                        isReassembledArr[Object.values(type)[0].vnName][`${name}`] = [];
                                    }

                                    if (quantity) {
                                        isReassembledArr[Object.values(type)[0].vnName][`${name}`].push({
                                            row,
                                            comment: comment || comment !== '' ? comment : null,
                                            isDone,
                                            quantity,
                                        });
                                    }

                                    continue;
                                }
                                // Store isRecalled materials
                                if (isRecalled) {
                                    if (!isRecalledArr[Object.values(type)[0].vnName]) {
                                        isRecalledArr[Object.values(type)[0].vnName] = {};
                                    }

                                    if (!isRecalledArr[Object.values(type)[0].vnName][`${name}`])
                                        isRecalledArr[Object.values(type)[0].vnName][`${name}`] = [];

                                    if (quantity) {
                                        isRecalledArr[Object.values(type)[0].vnName][`${name}`].push({
                                            row,
                                            comment: comment || comment !== '' ? comment : null,
                                            isDone,
                                            quantity,
                                        });
                                    }

                                    continue;
                                }
                                // isNew Materials columns
                                if (row === startRow + 5) {
                                    ws.cell(startRow + 2, isNewCol)
                                        .string(name)
                                        .style(rotateStyle);
                                    // isNew Material Types
                                    if (filteredMaterials.length + isNewStartCol - 1 === isNewCol) {
                                        ws.cell(startRow + 1, isNewStartCol, startRow + 1, isNewCol, true)
                                            .string(`${Object.values(type)[0].vnName}`)
                                            .style(titleStyle);
                                    }
                                }

                                // Pillar values for each material
                                if (quantity) {
                                    if (isDone) {
                                        const cell = ws
                                            .cell(row, isNewCol)
                                            .number(quantity)
                                            .style({
                                                ...style,
                                                fill: {
                                                    type: 'pattern',
                                                    patternType: 'solid',
                                                    bgColor: '#b1fa32',
                                                    fgColor: '#b1fa32',
                                                },
                                            });
                                        if (comment) {
                                            cell.comment(comment);
                                        }
                                    } else {
                                        const cell = ws.cell(row, isNewCol).number(quantity).style(style);
                                        if (comment) {
                                            cell.comment(comment);
                                        }
                                    }
                                }
                                isNewCol++;
                            }
                        }
                        row++;
                        endCol = isNewCol;
                    }
                    // New Material Tag
                    ws.cell(startRow, startCol + 6, startRow, endCol - 1, true)
                        .string('Phần vật tư lắp mới')
                        .style(titleStyle);

                    // isReassembled Material Tag
                    //  endCol = isReassembledCol;
                    if (Object.keys(isReassembledArr).length !== 0) {
                        const isReassembledStartCol = endCol;
                        for (const type in isReassembledArr) {
                            const isReassembledTypeStartCol = endCol;

                            for (const name in isReassembledArr[type]) {
                                for (const details of isReassembledArr[type][name]) {
                                    if (details.isDone) {
                                        const cell = ws
                                            .cell(details.row, endCol)
                                            .number(details.quantity)
                                            .style({
                                                ...style,
                                                fill: {
                                                    type: 'pattern',
                                                    patternType: 'solid',
                                                    bgColor: '#b1fa32',
                                                    fgColor: '#b1fa32',
                                                },
                                            });
                                        if (details.comment) {
                                            cell.comment(details.comment);
                                        }
                                    } else {
                                        const cell = ws.cell(details.row, endCol).number(details.quantity).style(style);
                                        if (details.comment) {
                                            cell.comment(details.comment);
                                        }
                                    }
                                }
                                ws.cell(startRow + 2, endCol)
                                    .string(name)
                                    .style({
                                        ...rotateStyle,
                                        fill: {
                                            type: 'pattern',
                                            patternType: 'solid',
                                            bgColor: '#eb9dc0',
                                            fgColor: '#eb9dc0',
                                        },
                                    });
                                endCol++;
                            }
                            ws.cell(startRow + 1, isReassembledTypeStartCol, startRow + 1, endCol - 1, true)
                                .string(type)
                                .style({
                                    ...titleStyle,
                                    fill: {
                                        type: 'pattern',
                                        patternType: 'solid',
                                        bgColor: '#eb9dc0',
                                        fgColor: '#eb9dc0',
                                    },
                                });
                            // endCol = isReassembledCol;
                        }
                        ws.cell(startRow, isReassembledStartCol, startRow, endCol - 1, true)
                            .string('Phần vật tư lắp lại')
                            .style({
                                ...titleStyle,
                                fill: { type: 'pattern', patternType: 'solid', bgColor: '#eb9dc0', fgColor: '#eb9dc0' },
                            });
                    }

                    // isRecalled Material Tag
                    if (Object.keys(isRecalledArr).length !== 0) {
                        const isRecalledtartCol = endCol;
                        for (const type in isRecalledArr) {
                            const isRecalledTypeStartCol = endCol;

                            for (const name in isRecalledArr[type]) {
                                for (const details of isRecalledArr[type][name]) {
                                    if (details.isDone) {
                                        const cell = ws
                                            .cell(details.row, endCol)
                                            .number(details.quantity)
                                            .style({
                                                ...style,
                                                fill: {
                                                    type: 'pattern',
                                                    patternType: 'solid',
                                                    bgColor: '#b1fa32',
                                                    fgColor: '#b1fa32',
                                                },
                                            });
                                        if (details.comment) {
                                            cell.comment(details.comment);
                                        }
                                    } else {
                                        const cell = ws.cell(details.row, endCol).number(details.quantity).style(style);
                                        if (details.comment) {
                                            cell.comment(details.comment);
                                        }
                                    }
                                }
                                ws.cell(startRow + 2, endCol)
                                    .string(name)
                                    .style({
                                        ...rotateStyle,
                                        fill: {
                                            type: 'pattern',
                                            patternType: 'solid',
                                            bgColor: '#c2edc7',
                                            fgColor: '#c2edc7',
                                        },
                                    });

                                endCol++;
                            }
                            ws.cell(startRow + 1, isRecalledTypeStartCol, startRow + 1, endCol - 1, true)
                                .string(type)
                                .style({
                                    ...titleStyle,
                                    fill: {
                                        type: 'pattern',
                                        patternType: 'solid',
                                        bgColor: '#c2edc7',
                                        fgColor: '#c2edc7',
                                    },
                                });
                            // endCol = isRecalledCol;
                        }
                        ws.cell(startRow, isRecalledtartCol, startRow, endCol - 1, true)
                            .string('Phần vật tư thu hồi')
                            .style({
                                ...titleStyle,
                                fill: { type: 'pattern', patternType: 'solid', bgColor: '#c2edc7', fgColor: '#c2edc7' },
                            });
                    }

                    // Total row
                    ws.cell(row, startCol).string('Cộng');

                    for (let i = 0; i < endCol - 3; i++) {
                        // total distance
                        const firstSum = excel.getExcelCellRef(stationStartRow + 1, startCol + 2 + i);
                        const lastSum = excel.getExcelCellRef(row - 1, startCol + 2 + i);
                        ws.cell(row, startCol + 2 + i).formula(`SUM(${firstSum}:${lastSum})`);
                    }

                    // total increment distance
                    const lastIncrement = excel.getExcelCellRef(row - 1, startCol + 3);
                    ws.cell(row, startCol + 3).formula(`=${lastIncrement}`);

                    ws.cell(row, startCol, row, endCol - 1).style({
                        ...titleStyle,
                        fill: { type: 'pattern', patternType: 'solid', bgColor: '#54de69', fgColor: '#54de69' },
                    });
                    row++;

                    // TK row
                    ws.cell(row, startCol).string('TK');
                    row++;

                    // Remaining row
                    ws.cell(row, startCol).string('CL');

                    for (let i = 0; i < endCol - 3; i++) {
                        const totalCell = excel.getExcelCellRef(row - 2, startCol + 2 + i);
                        const tkCell = excel.getExcelCellRef(row - 1, startCol + 2 + i);
                        ws.cell(row, startCol + 2 + i).formula(`${totalCell} - ${tkCell}`);
                    }
                    ws.cell(row - 1, startCol, row, endCol - 1).style({
                        ...titleStyle,
                        fill: { type: 'pattern', patternType: 'solid', bgColor: '#9bf29e', fgColor: '#9bf29e' },
                    });
                    row++;

                    // Station row
                    ws.cell(stationStartRow, startCol, stationStartRow, endCol - 1, true)
                        .string(name)
                        .style({
                            ...titleStyle,
                            alignment: { ...titleStyle.alignment, horizontal: 'left' },
                        });
                }
                // Route row
                ws.cell(routeStartRow, startCol, routeStartRow, endCol - 1, true)
                    .string(name)
                    .style({
                        ...titleStyle,
                        font: { ...titleStyle.font, color: '#FF0000' },
                        alignment: { ...titleStyle.alignment, horizontal: 'left' },
                    });
            }

            // Note row
            ws.cell(startRow, endCol, startRow + 2, endCol, true)
                .string('Ghi Chú')
                .style(titleStyle);
            for (const body of descriptionArr) {
                ws.cell(body.row, endCol).string(`${body.content}`).style(style);
            }

            // Project rows
            ws.cell(1, startCol, 1, endCol, true)
                .string(`${project.name}`)
                .style({
                    ...titleStyle,
                    border: {},
                    font: { ...titleStyle.font, color: '#FF0000', size: 13 },
                });
            ws.cell(2, startCol, 2, endCol, true)
                .string(`${project.location}`)
                .style({
                    ...titleStyle,
                    border: {},
                    font: { ...titleStyle.font, size: 13 },
                });

            // All borders
            ws.cell(startRow, startCol, row - 1, endCol).style({
                border: {
                    left: { style: 'thin', color: 'black' },
                    right: { style: 'thin', color: 'black' },
                },
            });
            ws.cell(row - 1, endCol).style({ border: { bottom: { style: 'thin', color: 'black' } } });

            return workbook;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new SummaryService();

const { ApiError } = require('../../helpers/ErrorHandler');
const { User, Project } = require('../../db/models');
const exportToWord = require('../../helpers/ExportToWord');
const { formatDate } = require('../../utils/formatDate');
const populateProject = require('../../helpers/PopulateProject');

const findObjectById = (array, id) => array.find((object) => object._id.toString() === id);

class CtaService {
    // [POST] /v1/activities/export
    async export(formData) {
        try {
            const { templateName, projectId, dataExport } = formData;

            let titles = [];
            switch (true) {
                case /^BM_Betong.*/.test(templateName) || /^PYC_NT.*/.test(templateName):
                    titles = [];
                    break;
                case /^BM_Mong.*/.test(templateName):
                    titles = ['mongs'];
                    break;
                case /^BM_Tru.*/.test(templateName):
                    titles = ['trus'];
                    break;
                case /^BM_Neo.*/.test(templateName):
                    titles = ['boChangs'];
                    break;
                case /^BM_KeoDay.*/.test(templateName):
                    titles = ['dayDans'];
                    break;
                case /^BM_TiepDia.*/.test(templateName):
                    titles = ['tiepDias'];
                    break;
                case /^BM_Tram.*/.test(templateName) || /^BM_LapDatPD.*/.test(templateName):
                    titles = ['thietBis'];
                    break;
                case /^BM_ThuHoi.*/.test(templateName):
                    titles = ['mongs', 'trus', 'boChangs', 'dayDans', 'xaSus', 'tiepDias', 'thietBis', 'phuKiens'];
                    break;
                default:
                    throw new ApiError(403, 'Invalid template name');
            }

            const project = await Project.findById(projectId)
                .populate({
                    path: 'manager',
                    select: '_id name',
                    populate: { path: 'job', select: '_id name' },
                })
                .populate({
                    path: 'leaders',
                    select: '_id name',
                    populate: { path: 'job', select: '_id name' },
                })
                .populate(populateProject('originalSummary updatedSummary'))
                .exec();

            // Find original and updated quantity
            const checkTemplate = /^BM_Betong\.|^PYC_NT/;
            if (!checkTemplate.test(templateName)) {
                let allRoutesDistance = 0;
                let allRoutesUpdatedQuantity = 0;
                let allRoutesOriginalQuantity = 0;

                for (const exportRoute of dataExport.routes) {
                    let routeDistance = 0;
                    let routeUpdatedQuantity = 0;
                    let routeOriginalQuantity = 0;
                    let groupItemUpdatedQuantity = 0;
                    let groupItemOriginalQuantity = 0;

                    let [originalRoute, updatedRoute] = await Promise.all([
                        findObjectById(project.originalSummary.routes, exportRoute._id),
                        findObjectById(project.updatedSummary.routes, exportRoute._id),
                    ]);

                    if (!originalRoute) {
                        const newRoute = { ...exportRoute };
                        for (const key in newRoute) {
                            if (typeof newRoute[key] === 'object') {
                                newRoute[key] = newRoute[key].map((item) => ({ ...item }));
                            } else {
                                newRoute[key] = 0;
                            }
                        }
                        originalRoute = newRoute;
                    }

                    exportRoute.name = updatedRoute.name;

                    for (const exportStation of exportRoute.stations) {
                        const groupItemMap = {};
                        let stationDistance = 0;
                        let [originalStation, updatedStation] = await Promise.all([
                            findObjectById(originalRoute.stations, exportStation._id),
                            findObjectById(updatedRoute.stations, exportStation._id),
                        ]);

                        if (!originalStation) {
                            const newStation = { ...exportStation };
                            for (const key in newStation) {
                                if (typeof newStation[key] === 'object') {
                                    newStation[key] = newStation[key].map((item) => ({ ...item }));
                                } else {
                                    newStation[key] = 0;
                                }
                            }
                            originalStation = newStation;
                        }

                        exportStation.name = updatedStation.name;

                        for (const exportPillar of exportStation.pillars) {
                            let [originalPillar, updatedPillar] = await Promise.all([
                                findObjectById(originalStation.pillars, exportPillar._id),
                                findObjectById(updatedStation.pillars, exportPillar._id),
                            ]);

                            const { ...items } = exportPillar;

                            if (!originalPillar) {
                                const newPillar = { ...exportPillar };
                                for (const key in newPillar) {
                                    if (typeof newPillar[key] === 'object') {
                                        newPillar[key] = newPillar[key].map((item) => ({ ...item, quantity: 0 }));
                                    } else {
                                        newPillar[key] = 0;
                                    }
                                }
                                originalPillar = newPillar;
                            }

                            exportPillar.name = updatedPillar.name;
                            exportPillar.distance = updatedPillar.distance;
                            exportPillar.lowLine = updatedPillar.lowLine;
                            exportPillar.middleLine = updatedPillar.middleLine;

                            for (const title of titles) {
                                for (let exportItem of items[title]) {
                                    const [originalItem, updatedItem] = await Promise.all([
                                        findObjectById(originalPillar[title], exportItem._id),
                                        findObjectById(updatedPillar[title], exportItem._id),
                                    ]);

                                    let itemRecalled;
                                    if (updatedItem.isRecalled) {
                                        exportPillar[title] = exportPillar[title].filter(
                                            (item) => item._id !== exportItem._id,
                                        );
                                        itemRecalled = {
                                            itemRecalledName: updatedItem.detail.name,
                                            itemRecalledComment: updatedItem.comment,
                                            itemRecalledOriginalQuantity: originalItem?.quantity ?? 0,
                                            itemRecalledUpdatedQuantity: updatedItem?.quantity ?? 0,
                                        };

                                        // Handle BM_ThuHoi
                                        if (templateName.includes('BM_ThuHoi')) {
                                            if (!groupItemMap[itemRecalled.itemRecalledName]) {
                                                groupItemMap[itemRecalled.itemRecalledName] = {
                                                    updatedQuantity: 0,
                                                    originalQuantity: 0,
                                                    comment: [],
                                                    pillarsName: [],
                                                };
                                            }
                                            groupItemMap[itemRecalled.itemRecalledName].pillarsName.push(
                                                exportPillar.name,
                                            );
                                            groupItemMap[itemRecalled.itemRecalledName].updatedQuantity +=
                                                itemRecalled.itemRecalledUpdatedQuantity;
                                            groupItemMap[itemRecalled.itemRecalledName].originalQuantity +=
                                                itemRecalled.itemRecalledOriginalQuantity;
                                            groupItemMap[itemRecalled.itemRecalledName].comment.push(
                                                itemRecalled.itemRecalledComment,
                                            );
                                        }

                                        continue;
                                    } else {
                                        exportItem.itemName = updatedItem.detail.name;
                                        exportItem.comment = updatedItem.comment;
                                        exportItem.originalQuantity = originalItem?.quantity ?? 0;
                                        exportItem.updatedQuantity = updatedItem?.quantity ?? 0;
                                    }

                                    // Handle BM_KeoDay
                                    if (
                                        templateName.includes('BM_KeoDay') &&
                                        !exportItem.itemName.toLowerCase().includes('cáp đồng')
                                    ) {
                                        if (!groupItemMap[exportItem.itemName]) {
                                            groupItemMap[exportItem.itemName] = {
                                                updatedQuantity: 0,
                                                distance: 0,
                                                firstPillarName: exportPillar.name,
                                                lastPillarName: exportPillar.name,
                                                comment: [],
                                            };
                                        }
                                        groupItemMap[exportItem.itemName].distance += exportPillar.distance;
                                        groupItemMap[exportItem.itemName].updatedQuantity += exportItem.updatedQuantity;
                                        groupItemMap[exportItem.itemName].lastPillarName = exportPillar.name;
                                        exportItem.comment !== ''
                                            ? groupItemMap[exportItem.itemName].comment.push(exportItem.comment)
                                            : null;
                                    }

                                    // Handle BM_Tram
                                    if (
                                        templateName.includes('BM_Tram') &&
                                        exportItem.itemName.toLowerCase().includes('máy biến áp')
                                    ) {
                                        if (!groupItemMap[exportItem.itemName]) {
                                            groupItemMap[exportItem.itemName] = {
                                                updatedQuantity: 0,
                                                originalQuantity: 0,
                                                pillarsName: [],
                                                comment: [],
                                            };
                                        }
                                        groupItemMap[exportItem.itemName].pillarsName.push(exportPillar.name);
                                        groupItemMap[exportItem.itemName].updatedQuantity += exportItem.updatedQuantity;
                                        groupItemMap[exportItem.itemName].originalQuantity +=
                                            exportItem.originalQuantity;
                                        groupItemMap[exportItem.itemName].comment.push(exportItem.comment);
                                    }

                                    // Handle BM_LapDatPD, Combo FCO - Cáp đồng - Dây chì
                                    if (
                                        templateName.includes('BM_LapDatPD') &&
                                        exportItem.itemName.toLowerCase().includes('fco')
                                    ) {
                                        if (!groupItemMap[exportItem.itemName]) {
                                            groupItemMap[exportItem.itemName] = {
                                                updatedQuantity: 0,
                                                originalQuantity: 0,
                                                comment: [],
                                            };
                                        }
                                        groupItemMap[exportItem.itemName].updatedQuantity += exportItem.updatedQuantity;
                                        groupItemMap[exportItem.itemName].originalQuantity +=
                                            exportItem.originalQuantity;
                                        groupItemMap[exportItem.itemName].comment.push(exportItem.comment);

                                        // Check cáp đồng
                                        const capDongString = ['cáp đồng'];
                                        const [pdCapDongOriginal, pdCapDongUpdated] = await Promise.all([
                                            originalPillar.dayDans.find((cd) =>
                                                cd.detail.name.toLowerCase().includes(capDongString),
                                            ),
                                            updatedPillar.dayDans.find((cd) =>
                                                cd.detail.name.toLowerCase().includes(capDongString),
                                            ),
                                        ]);

                                        if (pdCapDongUpdated) {
                                            if (!groupItemMap[pdCapDongUpdated.detail.name]) {
                                                groupItemMap[pdCapDongUpdated.detail.name] = {
                                                    updatedQuantity: 0,
                                                    originalQuantity: 0,
                                                    comment: [],
                                                };
                                            }
                                            groupItemMap[pdCapDongUpdated.detail.name].updatedQuantity +=
                                                pdCapDongUpdated.quantity;
                                            groupItemMap[pdCapDongUpdated.detail.name].originalQuantity +=
                                                pdCapDongOriginal.quantity;
                                            groupItemMap[pdCapDongUpdated.detail.name].comment.push(
                                                pdCapDongUpdated.comment,
                                            );
                                        }

                                        // check dây chì
                                        const dayChiString = ['fuselink', 'dây chì'];
                                        const [pdDayChiOriginal, pdDayChiUpdated] = await Promise.all([
                                            originalPillar.phuKiens.find((dc) =>
                                                dc.detail.name.toLowerCase().includes(dayChiString),
                                            ),
                                            updatedPillar.phuKiens.find((dc) =>
                                                dc.detail.name.toLowerCase().includes(dayChiString),
                                            ),
                                        ]);

                                        if (pdDayChiUpdated) {
                                            if (!groupItemMap[pdDayChiUpdated.detail.name]) {
                                                groupItemMap[pdDayChiUpdated.detail.name] = {
                                                    updatedQuantity: 0,
                                                    originalQuantity: 0,
                                                    comment: [],
                                                };
                                            }
                                            groupItemMap[pdDayChiUpdated.detail.name].updatedQuantity +=
                                                pdDayChiUpdated.quantity;
                                            groupItemMap[pdDayChiUpdated.detail.name].originalQuantity +=
                                                pdDayChiOriginal.quantity;
                                            groupItemMap[pdDayChiUpdated.detail.name].comment.push(
                                                pdDayChiUpdated.comment,
                                            );
                                        }
                                    }

                                    stationDistance += exportPillar.distance;
                                    routeUpdatedQuantity += exportItem.updatedQuantity;
                                    routeOriginalQuantity += exportItem.originalQuantity;
                                }
                            }
                        }
                        if (templateName.includes('BM_ThuHoi')) {
                            exportStation.groupItem = Object.entries(groupItemMap)?.map(
                                ([itemRecalledName, { ...properties }]) => ({
                                    itemRecalledName,
                                    ...properties,
                                }),
                            );
                        } else {
                            exportStation.groupItem = Object.entries(groupItemMap)?.map(
                                ([itemName, { originalQuantity, updatedQuantity, distance, ...properties }]) => ({
                                    itemName,
                                    ...properties,
                                    ...(originalQuantity && {
                                        originalQuantity:
                                            originalQuantity % 1 !== 0 ? originalQuantity.toFixed(2) : originalQuantity,
                                    }),
                                    ...(updatedQuantity && {
                                        updatedQuantity:
                                            updatedQuantity % 1 !== 0 ? updatedQuantity.toFixed(2) : updatedQuantity,
                                    }),
                                    ...(distance && { distance: distance.toFixed(2) }),
                                }),
                            );
                        }

                        // routeDistance += stationDistance;
                        routeDistance += Object.values(groupItemMap).reduce((acc, { distance }) => acc + distance, 0);

                        groupItemUpdatedQuantity += Object.values(groupItemMap).reduce(
                            (acc, { updatedQuantity }) => acc + updatedQuantity,
                            0,
                        );
                        groupItemOriginalQuantity += Object.values(groupItemMap).reduce(
                            (acc, { originalQuantity }) => acc + originalQuantity,
                            0,
                        );
                    }
                    exportRoute.routeDistance = routeDistance;
                    const checkGroupItemMap = /^BM_Tram\.|^BM_KeoDay\.|^BM_LapDatPD\./;
                    if (checkGroupItemMap.test(templateName)) {
                        exportRoute.routeUpdatedQuantity = groupItemUpdatedQuantity.toFixed(2);
                        exportRoute.routeOriginalQuantity = groupItemOriginalQuantity.toFixed(2);
                    } else {
                        exportRoute.routeUpdatedQuantity = routeUpdatedQuantity;
                        exportRoute.routeOriginalQuantity = routeOriginalQuantity;
                    }

                    allRoutesDistance += routeDistance;
                    allRoutesUpdatedQuantity += routeUpdatedQuantity;
                    allRoutesOriginalQuantity += routeOriginalQuantity;
                }
                dataExport.allRoutesDistance = allRoutesDistance;
                dataExport.allRoutesUpdatedQuantity = allRoutesUpdatedQuantity;
                dataExport.allRoutesOriginalQuantity = allRoutesOriginalQuantity;
            }

            const { day, month, year } = formatDate(dataExport.date);
            const data = {
                day,
                month,
                year,
                project,
                exportRoutes: dataExport.routes,
                allRoutesDistance: dataExport.allRoutesDistance,
                allRoutesOriginalQuantity: dataExport.allRoutesOriginalQuantity,
                allRoutesUpdatedQuantity: dataExport.allRoutesUpdatedQuantity,
            };

            const { buf, outputFilename } = await exportToWord(templateName, data);
            if (!buf) throw new ApiError(403, 'Không thể xuất tập tin, đã xảy ra sự cố');

            return { buf, outputFilename };
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new CtaService();

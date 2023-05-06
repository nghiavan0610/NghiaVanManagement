const populateProject = (path) => {
    return {
        path,
        populate: [
            { path: 'routes.stations.pillars.trus.detail' },
            { path: 'routes.stations.pillars.boChangs.detail' },
            { path: 'routes.stations.pillars.mongs.detail' },
            { path: 'routes.stations.pillars.dayDans.detail' },
            { path: 'routes.stations.pillars.das.detail' },
            { path: 'routes.stations.pillars.xaSus.detail' },
            { path: 'routes.stations.pillars.tiepDias.detail' },
            { path: 'routes.stations.pillars.phuKiens.detail' },
            { path: 'routes.stations.pillars.thietBis.detail' },
        ],
    };
};

module.exports = populateProject;

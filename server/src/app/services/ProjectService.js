const { ApiError } = require('../../helpers/ErrorHandler');
const { User, Project, Timesheet } = require('../../db/models');
const populateProject = require('../../helpers/PopulateProject');

const types = ['dayDans', 'trus', 'mongs', 'das', 'boChangs', 'tiepDias', 'xaSus', 'phuKiens', 'thietBis'];

class ProjectService {
    // [GET] /v1/projects
    async getAllProjects(pipeline, page, limit) {
        try {
            const projects = await Project.aggregate(pipeline).exec();
            const total =
                Array.isArray(projects[0].count) && projects[0].count.length > 0 ? projects[0].count[0].total : 0;
            const totalPages = Math.ceil(total / limit);
            return {
                projects: projects[0].results,
                page,
                totalProjects: total,
                totalPages,
            };
        } catch (err) {
            throw err;
        }
    }

    // [GET] /v1/projects/:projectSlug
    async getProjectBySlug(projectSlug) {
        try {
            const project = await Project.findOne({ slug: projectSlug })
                .populate('deletedBy', 'name')
                .populate(populateProject('originalSummary updatedSummary'))
                .populate({
                    path: 'manager leaders members',
                    select: '_id name deleted',
                    populate: { path: 'job', select: '_id name' },
                })
                .lean()
                .exec();
            if (!project) throw new ApiError(404, `Project was not found: ${projectSlug}`);

            let total = 0;
            let done = 0;
            if (project.updatedSummary) {
                for (const { stations } of project.updatedSummary.routes) {
                    for (const { pillars } of stations) {
                        for (const pillar of pillars) {
                            for (const type of types) {
                                for (const item of pillar[type]) {
                                    if (item.quantity) total++;
                                    if (item.quantity && item.isDone) done++;
                                }
                            }
                        }
                    }
                }
            }

            project.progress = parseFloat(((done / total) * 100).toFixed(2)) || 0;
            return project;
        } catch (err) {
            throw err;
        }
    }

    // [POST] /v1/projects/create
    async createProject(authUser, formData) {
        try {
            const { code, name, location, description, startedAt } = formData;

            const newProject = new Project({
                code,
                name,
                location,
                description,
                startedAt,
                manager: authUser.id,
            });
            await newProject.save();

            await authUser.projects.push(newProject._id);
            await authUser.save();

            return newProject;
        } catch (err) {
            if (err.name === 'MongoServerError' && err.code === 11000) {
                throw new ApiError(403, 'This project already exists. Please provide another code for project');
            }
            throw err;
        }
    }

    // [PUT] /v1/projects/:projectSlug/edit
    async updateProject(projectSlug, formData, authUser) {
        try {
            const { managerId, leadersId, membersId, ...info } = formData;

            const project = await Project.findOne({ slug: projectSlug }).exec();
            if (!project) throw new ApiError(404, `Project was not found: ${projectSlug}`);
            if (project.deleted) throw new ApiError(406, `This project has been disabled`);

            if (authUser.role !== 'admin' && !project.manager.equals(authUser.id)) {
                throw new ApiError(403, 'You are not manager of this project');
            }

            // remove manager from leaders and members. Then remove leaders from members
            const newLeadersId = new Set(leadersId);
            const newMembersId = new Set(membersId);
            if (newLeadersId.has(managerId)) {
                newLeadersId.delete(managerId);
            }
            if (newMembersId.has(managerId)) {
                newMembersId.delete(managerId);
            }
            if (newLeadersId.size > 0) {
                for (const id of newMembersId) {
                    if (newLeadersId.has(id)) {
                        newMembersId.delete(id);
                    }
                }
            }

            project.set({ ...info });

            // Update manager/ leaders/ members of Project
            const managerToAddId = managerId;
            const managerToRemoveId = project.manager;
            project.manager = managerId;

            // Update project leaders
            const existingLeadersIds = project.leaders.map((leader) => leader._id.toString());
            const leadersToAddIds = [...newLeadersId].filter((leaderId) => !existingLeadersIds.includes(leaderId));
            const leadersToRemoveIds = existingLeadersIds.filter(
                (existingLeaderId) => ![...newLeadersId].includes(existingLeaderId),
            );

            project.leaders.push(...leadersToAddIds);
            project.leaders = project.leaders.filter(
                (existingLeader) => !leadersToRemoveIds.includes(existingLeader._id.toString()),
            );

            // Update project members
            const existingMembersIds = project.members.map((member) => member._id.toString());
            const membersToAddIds = [...newMembersId].filter((memberId) => !existingMembersIds.includes(memberId));
            const membersToRemoveIds = existingMembersIds.filter(
                (existingMemberId) => ![...newMembersId].includes(existingMemberId),
            );

            project.members.push(...membersToAddIds);
            project.members = project.members.filter(
                (existingMember) => !membersToRemoveIds.includes(existingMember._id.toString()),
            );

            // Update manager/leaders/members with project data
            await User.updateMany(
                { $or: [{ _id: managerToRemoveId }, { _id: { $in: [...leadersToRemoveIds, ...membersToRemoveIds] } }] },
                { $pull: { projects: project._id } },
            ).exec();
            await User.updateMany(
                { $or: [{ _id: managerToAddId }, { _id: { $in: [...membersToAddIds, ...leadersToAddIds] } }] },
                { $push: { projects: project._id } },
            ).exec();

            await project.save();

            // Create a project timesheet
            if (project.timesheets.length === 0) {
                const timesheet = await Timesheet.create({
                    project: project._id,
                    manager: project.manager,
                    members: [...project.leaders, ...project.members],
                    startedAt: project.startedAt,
                    monthYear: info.startedAt.slice(0, 7),
                });

                project.timesheets.push(timesheet._id);
                await project.save();
            }

            return project;
        } catch (err) {
            if (err.name === 'MongoServerError' && err.code === 11000) {
                throw new ApiError(403, 'This project already exists. Please provide another code for project');
            }
            throw err;
        }
    }

    // [DELETE] /v1/projects/:projectSlug/delete
    async deleteProject(authUser, projectSlug) {
        try {
            const project = await this.getLeanProject(projectSlug);

            if (!project.manager.equals(authUser.id)) {
                throw new ApiError(403, 'You are not manager of this project');
            }

            await Project.updateOne({ _id: project._id }, { deleted: true, deletedBy: authUser._id });
            await User.updateMany({ projects: project._id }, { $pull: { projects: project._id } }).exec();
        } catch (err) {
            throw err;
        }
    }

    async getLeanProject(projectSlug) {
        try {
            const project = await Project.findOne({ slug: projectSlug }).lean().exec();
            if (!project) throw new ApiError(404, `Không tìm thấy dự án: ${projectSlug}`);
            return project;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = new ProjectService();

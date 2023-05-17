const request = require('supertest');
const { createServer } = require('../configs/server');
const { User, Job, Project } = require('../db/models');

const app = createServer();

beforeEach(async () => {
    await Job.deleteMany();
    await User.deleteMany();
    await Project.deleteMany();
});

const adminCredentials = { username: 'admin', password: 'p4ssword' };
const userCredentials = { username: 'user1', password: 'p4ssword' };

const signIn = async (credentials, options = {}) => {
    const agent = request(app).post('/v1/auth/signin');
    return agent.send(credentials);
};

const addUsers = async (numbers) => {
    for (let i = 0; i < 5; i++) {
        await Job.create({
            name: `job${i + 1}`,
            slug: `job${i + 1}`,
        });
    }

    const jobs = await Job.find().exec();

    const userPromises = [];
    for (let j = 0; j < numbers; j++) {
        userPromises.push(
            User.create({
                username: j == 0 ? 'admin' : j < 3 ? `manager${j}` : `user${j - 2}`,
                password: 'p4ssword',
                name: j == 0 ? 'admin' : j < 3 ? `manager${j}` : `user${j - 2}`,
                job: jobs[(Math.random() * jobs.length) | 0]._id,
                projects: [],
                role: j == 0 ? 'admin' : j < 3 ? 'manager' : 'user',
                slug: j == 0 ? 'admin' : j < 3 ? `manager${j}` : `user${j - 2}`,
            }),
        );
    }
    await Promise.all(userPromises);
};

describe('Get all users', () => {
    const getUsers = async (accessToken, queryParams = {}) => {
        let agent = request(app).get('/v1/users').set('Authorization', `Bearer ${accessToken}`);
        if (Object.keys(queryParams).length) {
            agent.query(queryParams);
        }
        return agent;
    };

    it('return first page and 10 users when there are 11 users in database', async () => {
        await addUsers(11);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);
        const response = await getUsers(accessToken);
        expect(response.status).toBe(200);
        expect(response.body.data.page).toBe(1);
        expect(response.body.data.users.length).toBe(10);
        expect(response.body.data.totalUsers).toBe(11);
        expect(response.body.data.totalPages).toBe(2);
    });
    it('return second page, totalPages 3 when there are 22 users in database', async () => {
        await addUsers(22);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);
        const response = await getUsers(accessToken, { page: 2 });
        expect(response.body.data.page).toBe(2);
        expect(response.body.data.totalUsers).toBe(22);
        expect(response.body.data.totalPages).toBe(3);
    });
    it('return last page, totalPages 4, limit 20, 12 users when there are 72 users in database', async () => {
        await addUsers(72);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);
        const response = await getUsers(accessToken, { page: 4, limit: 20 });
        expect(response.body.data.page).toBe(4);
        expect(response.body.data.users.length).toBe(12);
        expect(response.body.data.totalPages).toBe(4);
    });
    it('return page as 1 and limit as 10 when non numeric query params provided for both', async () => {
        await addUsers(17);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);
        const response = await getUsers(accessToken);
        expect(response.body.data.page).toBe(1);
        expect(response.body.data.totalPages).toBe(2);
    });
});

describe('Get user by slug', () => {
    const getUserBySlug = async (accessToken, slug) => {
        return await request(app).get(`/v1/users/${slug}`).set('Authorization', `Bearer ${accessToken}`);
    };

    it('return 200, correct user slug when user exist ', async () => {
        await addUsers(2);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);
        const response = await getUserBySlug(accessToken, 'manager1');
        expect(response.status).toBe(200);
        expect(response.body.data.user.slug).toBe('manager1');
    });
    it('return 404 when user not found ', async () => {
        await addUsers(2);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);
        const response = await getUserBySlug(accessToken, 'user10');
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User was not found: user10');
    });
});

describe('Get my projects', () => {
    const getUserProjects = async (accessToken) => {
        return await request(app).get(`/v1/users/my-projects`).set('Authorization', `Bearer ${accessToken}`);
    };

    const addProjects = async (numbers, userSlug) => {
        const user = await User.findOne({ slug: userSlug }).exec();

        for (let i = 0; i < numbers; i++) {
            const project = await Project.create({
                code: `code${i + 1}`,
                name: `project${i + 1}`,
                slug: `project${i + 1}`,
            });
            await user.projects.push(project._id);
            await user.save();
        }
    };

    it('return 200, empty project lists when user have not any project', async () => {
        await addUsers(1);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);
        const response = await getUserProjects(accessToken);
        expect(response.status).toBe(200);
        expect(response.body.data.projects.length).toBe(0);
    });
    it('return 200, 2 project in projects lists when user have 2 project', async () => {
        await addUsers(1);
        await addProjects(2, 'admin');
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);
        const response = await getUserProjects(accessToken);
        expect(response.status).toBe(200);
        expect(response.body.data.projects.length).toBe(2);
    });
});

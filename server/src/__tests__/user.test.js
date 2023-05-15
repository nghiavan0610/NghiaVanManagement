const request = require('supertest');
const { createServer } = require('../configs/server');
const { User, Job } = require('../db/models');

const app = createServer();

beforeEach(async () => {
    await Job.deleteMany();
    await User.deleteMany();
});

const adminCredentials = { username: 'admin', password: 'p4ssword' };
const userCredentials = { username: 'user1', password: 'p4ssword' };
const signIn = async (credentials, options = {}) => {
    const agent = request(app).post('/v1/auth/signin');
    return await agent.send(credentials);
};

const getUsers = async (accessToken, queryParams = {}) => {
    let agent = request(app).get('/v1/users').set('Authorization', `Bearer ${accessToken}`);
    if (Object.keys(queryParams).length) {
        agent.query(queryParams);
    }
    return agent;
};

const addUsers = async (numbers) => {
    for (let i = 0; i < 5; i++) {
        await Job.create({
            name: `job${i + 1}`,
            slug: `job${i + 1}`,
        });
    }
    const jobs = await Job.find().exec();

    const promises = [];
    for (let j = 0; j < numbers; j++) {
        promises.push(
            User.create({
                username: j == 0 ? 'admin' : `user${j + 1}`,
                password: 'p4ssword',
                name: j == 0 ? 'admin' : `user${j + 1}`,
                job: jobs[(Math.random() * jobs.length) | 0]._id,
                role: j == 0 ? 'admin' : j < 5 ? 'manager' : 'user',
                slug: j == 0 ? 'admin' : `user${j + 1}`,
            }),
        );
    }
    await Promise.all(promises);
};

describe('Route /users', () => {
    describe('Get all users', () => {
        it('return first page and 10 users when there are 11 users in database', async () => {
            await addUsers(11);
            const userSignIn = await signIn(adminCredentials);
            const response = await getUsers(userSignIn.body.data.accessToken);
            expect(response.status).toBe(200);
            expect(response.body.data.page).toBe(1);
            expect(response.body.data.users.length).toBe(10);
            expect(response.body.data.totalUsers).toBe(11);
            expect(response.body.data.totalPages).toBe(2);
        });
        it('return second page, totalPages 3 when there are 22 users in database', async () => {
            await addUsers(22);
            const userSignIn = await signIn(adminCredentials);
            const response = await getUsers(userSignIn.body.data.accessToken, { page: 2 });
            expect(response.body.data.page).toBe(2);
            expect(response.body.data.totalUsers).toBe(22);
            expect(response.body.data.totalPages).toBe(3);
        });
        it('return last page, totalPages 4, limit 20, 12 users when there are 72 users in database', async () => {
            await addUsers(72);
            const userSignIn = await signIn(adminCredentials);
            const response = await getUsers(userSignIn.body.data.accessToken, { page: 4, limit: 20 });
            expect(response.body.data.page).toBe(4);
            expect(response.body.data.users.length).toBe(12);
            expect(response.body.data.totalPages).toBe(4);
        });
        it('return page as 1 and limit as 10 when non numeric query params provided for both', async () => {
            await addUsers(17);
            const userSignIn = await signIn(adminCredentials);
            const response = await getUsers(userSignIn.body.data.accessToken);
            expect(response.body.data.page).toBe(1);
            expect(response.body.data.totalPages).toBe(2);
        });
    });
});

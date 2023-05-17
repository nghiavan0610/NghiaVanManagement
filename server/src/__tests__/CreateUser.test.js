const request = require('supertest');
const { createServer } = require('../configs/server');
const { User, Job } = require('../db/models');

const app = createServer();

beforeEach(async () => {
    await Job.deleteMany();
    await User.deleteMany();
});

const adminCredentials = { username: 'admin', password: 'p4ssword' };
const amanagerCredentials = { username: 'manager1', password: 'p4ssword' };
const userCredentials = { username: 'user1', password: 'p4ssword' };
const validUser = { username: 'user100', name: 'user100' };

const signIn = async (credentials, options = {}) => {
    return await request(app).post('/v1/auth/signin').send(credentials);
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

describe('Create user', () => {
    const createUser = async (accessToken, user) => {
        return await request(app).post('/v1/users/create').set('Authorization', `Bearer ${accessToken}`).send(user);
    };

    it('return 201, username, name, jobId, slug when request is valid', async () => {
        await addUsers(1);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);

        const job = await Job.find().limit(1).exec();

        const response = await createUser(accessToken, { ...validUser, jobId: job[0]._id.toString() });
        expect(response.status).toBe(201);
        expect(response.body.data.newUser.username).toBe('user100');
        expect(response.body.data.newUser.name).toBe('user100');
        expect(response.body.data.newUser.slug).toBe('user100');
        expect(response.body.data.newUser.job).toBe(job[0]._id.toString());
    });
    it('return 403 when full name is empty', async () => {
        await addUsers(1);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);

        const response = await createUser(accessToken, { username: 'user1', name: '' });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Please provide full name for this user');
    });
    it('return 403 when username already exists', async () => {
        await addUsers(1);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);

        const response = await createUser(accessToken, { username: 'admin', name: 'admin' });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Username already exists');
    });
    it('return 403 when jobId was not found', async () => {
        await addUsers(1);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);

        const response = await createUser(accessToken, { ...validUser, jobId: 123 });
        expect(response.status).toBe(403);
    });
    it('return 403 when wrong email format', async () => {
        await addUsers(1);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);

        const response = await createUser(accessToken, { ...validUser, email: 'test' });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid Email Address');
    });
    it('return 403 when wrong phone number format', async () => {
        await addUsers(1);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);

        const response = await createUser(accessToken, { ...validUser, phoneNumber: 123 });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Your phone number must between 9 and 11 numbers');
    });
    it('return 401 when your role is not admin or manager', async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(userCredentials);

        const response = await createUser(accessToken, { ...validUser });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('You do not have permission to perform this action');
    });
});

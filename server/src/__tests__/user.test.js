const request = require('supertest');
const { createServer } = require('../configs/server');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const db = require('../configs/init.mongodb');
const redis = require('../configs/init.redis');
const { User, Job } = require('../db/models');
const bcrypt = require('bcrypt');

const app = createServer();

beforeEach(async () => {
    await Job.deleteMany();
    await User.deleteMany();
});

const getUsers = (options = {}) => {
    const agent = request(app).get('/v1/users');
    if (options.token) {
        agent.set('Authorization', `Bearer ${options.token}`);
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

    for (let i = 0; i < numbers; i++) {
        await User.create({
            username: `user${i + 1}`,
            name: `user${i + 1} test`,
            job: jobs[(Math.random() * jobs.length) | 0]._id.toString(),
            slug: `user${i + 1}`,
        });
    }
};

describe('Route /users', () => {
    describe('Get all users', () => {
        it('return status 200 and page object as response body when there are no user in database', async () => {
            const response = await getUsers();
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual({
                users: [],
                page: 1,
                totalUsers: 0,
                totalPages: 0,
            });
        });
        it('return first page and 10 users when there are 11 users in database', async () => {
            await addUsers(11);
            const response = await getUsers();
            expect(response.status).toBe(200);
            expect(response.body.data.page).toBe(1);
            expect(response.body.data.users.length).toBe(10);
            expect(response.body.data.totalUsers).toBe(11);
            expect(response.body.data.totalPages).toBe(2);
        });
        it('return second page, totalPages 3 when there are 22 users in database', async () => {
            await addUsers(22);
            const response = await getUsers().query({ page: 2 });
            expect(response.body.data.page).toBe(2);
            expect(response.body.data.totalUsers).toBe(22);
            expect(response.body.data.totalPages).toBe(3);
        });
    });
});

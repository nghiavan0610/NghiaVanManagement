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
const validUser = {
    username: 'user1',
    name: 'user1',
};

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

describe('Edit Account', () => {
    const updateUserAccount = async (accessToken, slug, body) => {
        return await request(app)
            .put(`/v1/users/${slug}/edit-account`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(body);
    };

    it(`{User} return 403 when you're editing an account that's not yours`, async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(userCredentials);
        const response = await updateUserAccount(accessToken, 'admin');
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('You do not have permission to perform this action');
    });
    it(`{User} return 201, updated user when request is valid`, async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(userCredentials);
        const response = await updateUserAccount(accessToken, 'user1', validUser);
        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('updatedUser');
    });
    it(`{User} return 403 when username already exists`, async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(userCredentials);
        const response = await updateUserAccount(accessToken, 'user1', { username: 'admin' });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Username already exists');
    });
    it(`{User} return 403 when wrong email format`, async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(userCredentials);
        const response = await updateUserAccount(accessToken, 'user1', { ...validUser, email: 'test@haha' });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid Email Address');
    });
    it(`{User} return 403 when wrong birthday format`, async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(userCredentials);
        const response = await updateUserAccount(accessToken, 'user1', { ...validUser, DOB: 'test@haha' });
        expect(response.status).toBe(403);
        expect(response.body.message).toMatch('Cast to date failed');
    });
    it(`{User} return 403 when wrong birthday format`, async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(userCredentials);
        const response = await updateUserAccount(accessToken, 'user1', { ...validUser, DOB: '3000-1-1' });
        expect(response.status).toBe(403);
        expect(response.body.message).toMatch('Your birthday cannot be greater than present year');
    });
    it(`{User} user can not update their role or job`, async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(userCredentials);
        const response = await updateUserAccount(accessToken, 'user1', { ...validUser, role: 'admin', jobId: 123 });
        expect(response.body.data.updatedUser.role).not.toBe('admin');
        expect(response.body.data.updatedUser.job).not.toBe(123);
    });
    it(`{User} return 200, email, phone, gender, DOB when request is valid`, async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(userCredentials);
        const response = await updateUserAccount(accessToken, 'user1', {
            ...validUser,
            email: 'user1@gmail.com',
            phoneNumber: '018392812',
            DOB: '2000-01-01',
            gender: 'female',
        });
        expect(response.status).toBe(201);
        expect(response.body.data.updatedUser.email).toBe('user1@gmail.com');
        expect(response.body.data.updatedUser.gender).toBe('female');
        expect(response.body.data.updatedUser.DOB).toMatch('2000-01-01');
        expect(response.body.data.updatedUser.phoneNumber).toBe('018392812');
    });
    it(`{Admin} admin can update all account when request is valid`, async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);
        const response = await updateUserAccount(accessToken, 'user1', { ...validUser });
        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('updatedUser');
    });
    it(`{Admin} admin can update user role and job`, async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);
        const job = await Job.find().limit(1).exec();
        const response = await updateUserAccount(accessToken, 'user1', {
            ...validUser,
            role: 'manager',
            jobId: job[0]._id.toString(),
        });
        expect(response.status).toBe(201);
        expect(response.body.data.updatedUser.role).toBe('manager');
        expect(response.body.data.updatedUser.job).toBe(`${job[0]._id.toString()}`);
    });
});

describe('Edit Security', () => {
    const updateUserSecurity = async (accessToken, slug, body) => {
        return await request(app)
            .put(`/v1/users/${slug}/edit-security`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(body);
    };
    it(`{User} return 403 when you change password not your account`, async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(userCredentials);
        const response = await updateUserSecurity(accessToken, 'admin');
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('You do not have permission to perform this action');
    });
    it(`{User} return 201 when request is valid. Then test old and new password`, async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(userCredentials);
        const response = await updateUserSecurity(accessToken, 'user1', {
            oldPassword: 'p4ssword',
            newPassword: 'testpass',
            confirmPassword: 'testpass',
        });
        expect(response.status).toBe(201);
        expect(response.body.data).toBe('Your password has been updated');

        const oldPassword = await signIn(userCredentials);
        expect(oldPassword.status).toBe(401);
        expect(oldPassword.body.message).toBe('Invalid username or password');

        const newPassword = await signIn({ username: 'user1', password: 'testpass' });
        expect(newPassword.status).toBe(200);
        expect(Object.keys(newPassword.body.data)).toEqual(['accessToken', 'refreshToken', 'user']);
    });
    it('{User} return 403 when password is not correct', async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(userCredentials);
        const response = await updateUserSecurity(accessToken, 'user1', {
            oldPassword: 'hi',
            newPassword: 'testpass',
            confirmPassword: 'testpass',
        });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Your password is incorrect');
    });
    it('{User} return 403 when wrong new password format', async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(userCredentials);
        const response = await updateUserSecurity(accessToken, 'user1', {
            oldPassword: 'p4ssword',
            newPassword: 'hi',
            confirmPassword: 'hi',
        });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Your password must be between 6 and 20 characters');
    });
    it('{User} return 403 when confirm password is not match', async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(userCredentials);
        const response = await updateUserSecurity(accessToken, 'user1', {
            oldPassword: 'p4ssword',
            newPassword: 'testpass',
            confirmPassword: 'testpass123',
        });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Confirm password is incorrect');
    });
    it(`{Admin} admin can change password all account when request is valid. Then user test new password`, async () => {
        await addUsers(6);
        const {
            body: {
                data: { accessToken },
            },
        } = await signIn(adminCredentials);
        const response = await updateUserSecurity(accessToken, 'user1', {
            newPassword: 'testpass',
            confirmPassword: 'testpass',
        });
        expect(response.status).toBe(201);
        expect(response.body.data).toBe('Your password has been updated');

        const newPassword = await signIn({ username: 'user1', password: 'testpass' });
        expect(newPassword.status).toBe(200);
        expect(Object.keys(newPassword.body.data)).toEqual(['accessToken', 'refreshToken', 'user']);
    });
});

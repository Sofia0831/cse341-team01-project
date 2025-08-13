const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server'); 
const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('User GET Endpoints', () => {
    let user;
    let otherUser;
    let authToken;

    beforeAll(async () => {
        const mongoDbUrl = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/testdb';

        await mongoose.disconnect();

        await mongoose.connect(mongoDbUrl);
        console.log('Connected to test database.');
    });

    afterAll(async () => {
        await mongoose.connection.close();
        console.log('Disconnected from test database.');
    });

    beforeEach(async () => {
        await User.deleteMany({});

        const hashedPassword = await bcrypt.hash('test123', 10);

        user = await User.create({
            firstName: 'Test',
            lastName: 'User',
            userName: 'testuser',
            email: 'testuser@gmail.com',
            password: hashedPassword,
            role: 'admin',
            address: '123 Fake Address St.',
            number: '123456789'
        });

        otherUser = await User.create({
            firstName: 'Another',
            lastName: 'User',
            userName: 'anotheruser',
            email: 'another@gmail.com',
            password: hashedPassword,
            role: 'customer',
            address: '456 Test Drive',
            number: '987654321'
        });

        const loginRes = await request(app)
            .post('/auth/login')
            .send({
                loginDetail: 'testuser@gmail.com',
                password: 'test123'
            });

        authToken = loginRes.body.token;

        if (!authToken) {
            console.error('Login failed, no token received.');
            throw new Error('Authentication token not received, tests cannot proceed.');
        }
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it('should return 401 for an unauthenticated request to getAllUsers', async () => {
        const res = await request(app)
            .get('/users')
            .expect(401);
            
        expect(res.body.error).toBeDefined();
    });

    it('should return all users with a valid token', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
        
        const returnedUser = res.body.find(u => u.email === user.email);
        expect(returnedUser.firstName).toBe('Test');
        expect(returnedUser.email).toBe('testuser@gmail.com');

        const returnedOtherUser = res.body.find(u => u.email === otherUser.email);
        expect(returnedOtherUser.firstName).toBe('Another');
        expect(returnedOtherUser.email).toBe('another@gmail.com');
    });

    it('should return details for the currently logged-in user', async () => {
        const res = await request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(res.body.email).toBe('testuser@gmail.com');
        expect(res.body.firstName).toBe('Test');
        expect(res.body.password).toBeUndefined();
    });

    it('should return 401 for an unauthenticated request to getMe', async () => {
        const res = await request(app)
            .get('/users/me')
            .expect(401);
            
        expect(res.body.error).toBeDefined();
    });
});

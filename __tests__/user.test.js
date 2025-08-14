const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('User GET Endpoints', () => {
    let user;
    let otherUser;
    let authToken;

    beforeEach(async () => {
        // Crucially, this deletes all existing user documents before each test.
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
const request = require('supertest');
const { app } = require('../server');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');

describe('Cart GET Endpoint', () => {
    let testUser;
    let testProduct;
    let authToken;

    beforeEach(async () => {
        await Cart.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await User.create({
            firstName: 'Test',
            lastName: 'User',
            userName: 'testuser',
            email: 'test@example.com',
            password: hashedPassword,
            role: 'customer'
        });
        testProduct = await Product.create({
            name: 'Test Product',
            price: 99.99,
            category: 'electronics',
            stock: 10
        });
        const loginRes = await request(app)
            .post('/auth/login')
            .send({
                loginDetail: testUser.email,
                password: 'password123'
            });
        authToken = loginRes.body.token;
        if (!authToken) {
            throw new Error('Authentication token not received, tests cannot proceed.');
        }
    });

    afterEach(async () => {
        await Cart.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});
    });

    test('should return an existing cart for a logged-in user with a valid token', async () => {
        const existingCart = await Cart.create({
            user: testUser._id,
            items: [{ product: testProduct._id, quantity: 2 }]
        });
        const res = await request(app)
            .get('/cart')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        expect(res.body).toHaveProperty('_id', existingCart._id.toString());
        expect(res.body.user).toBe(testUser._id.toString());
        expect(res.body.items.length).toBe(1);
        expect(res.body.items[0].product._id).toBe(testProduct._id.toString());
        expect(res.body.items[0].product.name).toBe('Test Product');
        expect(res.body.items[0].quantity).toBe(2);
    });

    test('should create a new, empty cart if one does not exist', async () => {
        const res = await request(app)
            .get('/cart')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.user).toBe(testUser._id.toString());
        expect(res.body.items.length).toBe(0);

        const newCart = await Cart.findOne({ user: testUser._id });
        expect(newCart).not.toBeNull();
    });

    test('should return a 500 status code on a server error', async () => {
        const findOneMock = jest.spyOn(Cart, 'findOne').mockImplementationOnce(() => {
            throw new Error('Simulated database error');
        });
        const res = await request(app)
            .get('/cart')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(500);
        expect(res.body.message).toBe('Simulated database error');
        findOneMock.mockRestore();
    });

    test('should return a 401 status code for an unauthenticated request', async () => {
        const res = await request(app)
            .get('/cart')
            .expect(401);
        expect(res.body.error).toBe('Access denied. No token provided.');
    });
});

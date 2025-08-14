const request = require('supertest');
const { app } = require('../server');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('Order GET Endpoints', () => {
    let customerUser;
    let adminUser;
    let customerToken;
    let adminToken;
    let testProduct;
    const testPassword = 'password123';

    beforeEach(async () => {
        await Order.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});

        testProduct = await Product.create({
            name: 'Test Product',
            price: 99.99,
            category: 'electronics',
            stock: 50
        });

        const customerHashedPassword = await bcrypt.hash(testPassword, 10);
        customerUser = await User.create({
            firstName: 'Customer',
            lastName: 'User',
            userName: 'customeruser',
            email: 'customer@test.com',
            password: customerHashedPassword,
            role: 'customer'
        });

        const adminHashedPassword = await bcrypt.hash(testPassword, 10);
        adminUser = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            userName: 'adminuser',
            email: 'admin@test.com',
            password: adminHashedPassword,
            role: 'admin'
        });

        const customerLoginRes = await request(app)
            .post('/auth/login')
            .send({ loginDetail: customerUser.email, password: testPassword });
        customerToken = customerLoginRes.body.token;

        const adminLoginRes = await request(app)
            .post('/auth/login')
            .send({ loginDetail: adminUser.email, password: testPassword });
        adminToken = adminLoginRes.body.token;

        if (!customerToken || !adminToken) {
            throw new Error('Authentication token not received, tests cannot proceed.');
        }
    });

    afterEach(async () => {
        await Order.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});
    });

    test('should return all orders for a logged-in customer', async () => {
        const order1 = await Order.create({
            user: customerUser._id,
            items: [{ product: testProduct._id, quantity: 1, priceAtPurchase: 99.99 }],
            totalAmount: 99.99,
            shippingAddress: '123 Test St',
            paymentMethod: 'Credit Card'
        });

        const res = await request(app)
            .get('/orders/my-orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .expect(200);

        expect(res.body.length).toBe(1);
        expect(res.body[0].user).toBe(customerUser._id.toString());
        expect(res.body[0].items[0].product._id).toBe(testProduct._id.toString());
    });

    test('should return an empty array for a customer with no orders', async () => {
        const res = await request(app)
            .get('/orders/my-orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .expect(200);

        expect(res.body).toEqual([]);
    });

    test('should return all orders for an admin user', async () => {
        await Order.create({
            user: customerUser._id,
            items: [{ product: testProduct._id, quantity: 1, priceAtPurchase: 99.99 }],
            totalAmount: 99.99,
            shippingAddress: '123 Test St',
            paymentMethod: 'Credit Card'
        });
        await Order.create({
            user: adminUser._id,
            items: [{ product: testProduct._id, quantity: 2, priceAtPurchase: 99.99 }],
            totalAmount: 199.98,
            shippingAddress: '456 Admin St',
            paymentMethod: 'PayPal'
        });

        const res = await request(app)
            .get('/orders/all')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(res.body.length).toBe(2);
        const userIds = res.body.map(order => order.user._id);
        expect(userIds).toContain(customerUser._id.toString());
        expect(userIds).toContain(adminUser._id.toString());
    });

    test('should return a 403 Forbidden error for a non-admin accessing all orders', async () => {
        const res = await request(app)
            .get('/orders/all')
            .set('Authorization', `Bearer ${customerToken}`)
            .expect(403);

        expect(res.body.error).toBe('Access denied. Insufficient role.');
    });
});

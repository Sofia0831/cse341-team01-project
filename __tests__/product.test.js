const request = require('supertest');
const { app } = require('../server');
const Product = require('../models/Product');

describe('Product GET All Endpoint', () => {
    const productsData = [
        { name: 'Laptop', category: 'electronics', price: 1200, stock: 5 },
        { name: 'Headphones', category: 'electronics', price: 150, stock: 12 },
        { name: 'Book', category: 'books', price: 15, stock: 30 },
    ];

    beforeEach(async () => {
        await Product.deleteMany({});
        await Product.insertMany(productsData);
    });

    afterEach(async () => {
        await Product.deleteMany({});
    });

    test('should return all products when no category query is provided', async () => {
        const res = await request(app)
            .get('/products')
            .expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(productsData.length);
        
        const returnedProductNames = res.body.map(p => p.name);
        expect(returnedProductNames).toEqual(expect.arrayContaining(['Laptop', 'Headphones', 'Book']));
    });

    test('should return only products from the specified category', async () => {
        const res = await request(app)
            .get('/products?category=electronics')
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
        
        expect(res.body.every(p => p.category === 'electronics')).toBe(true);
        expect(res.body.some(p => p.name === 'Laptop')).toBe(true);
        expect(res.body.some(p => p.name === 'Headphones')).toBe(true);
    });

    test('should return an empty array if the specified category does not exist', async () => {
        const res = await request(app)
            .get('/products?category=nonexistent')
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });
    
    test('should return a 500 status code on a server error', async () => {
        const findMock = jest.spyOn(Product, 'find').mockImplementationOnce(() => {
            throw new Error('Simulated database error');
        });

        const res = await request(app)
            .get('/products')
            .expect(500);
        expect(res.body.error).toBe('Server error');
        
        findMock.mockRestore();
    });
});
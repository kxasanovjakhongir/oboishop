const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const Order = require('../models/Order');
const Wallpaper = require('../models/Wallpaper');
const Category = require('../models/Category');
const { makeAdminToken } = require('./helpers');

let token;
let wallpaper;
let discountedWallpaper;

beforeAll(async () => {
  await db.connect();
  token = await makeAdminToken();
  const category = await Category.create({ name: 'Kategoriya' });
  wallpaper = await Wallpaper.create({ name: 'Oddiy oboy', price: 100000, category: category._id });
  discountedWallpaper = await Wallpaper.create({ name: 'Chegirmali oboy', price: 200000, discount: 25, category: category._id });
});
afterEach(async () => Order.deleteMany({}));
afterAll(async () => db.closeDatabase());

describe('POST /api/orders', () => {
  it('computes the price server-side from the wallpaper, ignoring any client-supplied price', async () => {
    const res = await request(app).post('/api/orders').send({
      items: [{ wallpaperId: wallpaper._id, quantity: 2, price: 1 }], // client price must be ignored
      customerName: 'Test Mijoz',
      phone: '+998901234567',
    });
    expect(res.status).toBe(201);
    expect(res.body.items[0].price).toBe(100000);
    expect(res.body.totalPrice).toBe(200000);
    expect(res.body.orderNumber).toMatch(/^ORD-\d{5}$/);
    expect(res.body.status).toBe('new');
  });

  it('applies the wallpaper discount when computing price', async () => {
    const res = await request(app).post('/api/orders').send({
      items: [{ wallpaperId: discountedWallpaper._id, quantity: 1 }],
      customerName: 'Test Mijoz',
      phone: '+998901234567',
    });
    expect(res.status).toBe(201);
    // 200000 * (1 - 25/100) = 150000
    expect(res.body.items[0].price).toBe(150000);
  });

  it('rejects an order with no items', async () => {
    const res = await request(app).post('/api/orders').send({ items: [], customerName: 'X', phone: '+998901234567' });
    expect(res.status).toBe(400);
  });

  it('rejects an order missing customer name or phone', async () => {
    const res = await request(app).post('/api/orders').send({ items: [{ wallpaperId: wallpaper._id, quantity: 1 }] });
    expect(res.status).toBe(400);
  });

  it('assigns sequential order numbers', async () => {
    const first = await request(app).post('/api/orders').send({
      items: [{ wallpaperId: wallpaper._id, quantity: 1 }], customerName: 'A', phone: '+998900000001',
    });
    const second = await request(app).post('/api/orders').send({
      items: [{ wallpaperId: wallpaper._id, quantity: 1 }], customerName: 'B', phone: '+998900000002',
    });
    expect(second.body.orderNumber).not.toBe(first.body.orderNumber);
  });
});

describe('GET /api/orders', () => {
  it('requires an admin token', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('filters by status', async () => {
    const order = await Order.create({
      orderNumber: 'ORD-90001',
      items: [{ wallpaper: wallpaper._id, name: wallpaper.name, price: 100000, quantity: 1 }],
      totalPrice: 100000,
      customerName: 'X',
      phone: '+998900000000',
      status: 'confirmed',
    });
    await Order.create({
      orderNumber: 'ORD-90002',
      items: [{ wallpaper: wallpaper._id, name: wallpaper.name, price: 100000, quantity: 1 }],
      totalPrice: 100000,
      customerName: 'Y',
      phone: '+998900000000',
      status: 'new',
    });

    const res = await request(app).get('/api/orders').query({ status: 'confirmed' }).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]._id).toBe(order._id.toString());
  });
});

describe('PATCH /api/orders/:id/status', () => {
  it('updates the status', async () => {
    const order = await Order.create({
      orderNumber: 'ORD-90003',
      items: [{ wallpaper: wallpaper._id, name: wallpaper.name, price: 100000, quantity: 1 }],
      totalPrice: 100000,
      customerName: 'X',
      phone: '+998900000000',
    });
    const res = await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'delivered' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('delivered');
  });

  it('rejects an invalid status value', async () => {
    const order = await Order.create({
      orderNumber: 'ORD-90004',
      items: [{ wallpaper: wallpaper._id, name: wallpaper.name, price: 100000, quantity: 1 }],
      totalPrice: 100000,
      customerName: 'X',
      phone: '+998900000000',
    });
    const res = await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'teleported' });
    expect(res.status).toBe(400);
  });
});

const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const Category = require('../models/Category');
const { makeAdminToken } = require('./helpers');

let token;

beforeAll(async () => {
  await db.connect();
  token = await makeAdminToken();
});
afterEach(async () => {
  await Category.deleteMany({});
});
afterAll(async () => db.closeDatabase());

describe('Categories', () => {
  it('creates a category (admin only)', async () => {
    const res = await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).field('name', 'Klassik');
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Klassik');
  });

  it('rejects creation without a token', async () => {
    const res = await request(app).post('/api/categories').field('name', 'Modern');
    expect(res.status).toBe(401);
  });

  it('lists categories sorted by name', async () => {
    await Category.create([{ name: 'Zebra' }, { name: 'Avangard' }]);
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.map((c) => c.name)).toEqual(['Avangard', 'Zebra']);
  });

  it('updates a category', async () => {
    const cat = await Category.create({ name: 'Eski nom' });
    const res = await request(app).put(`/api/categories/${cat._id}`).set('Authorization', `Bearer ${token}`).field('name', 'Yangi nom');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Yangi nom');
  });

  it('deletes a category', async () => {
    const cat = await Category.create({ name: "O'chiriladigan" });
    const res = await request(app).delete(`/api/categories/${cat._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(await Category.findById(cat._id)).toBeNull();
  });

  it('404s deleting a category that does not exist', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app).delete(`/api/categories/${fakeId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const History = require('../models/History');
const { makeAdminToken } = require('./helpers');

let token;

beforeAll(async () => {
  await db.connect();
  token = await makeAdminToken();
});
afterEach(async () => History.deleteMany({}));
afterAll(async () => db.closeDatabase());

describe('History', () => {
  it('lists history entries ordered by "order" then creation date', async () => {
    await History.create([
      { year: '2020', text: 'Ikkinchi', order: 1 },
      { year: '2014', text: 'Birinchi', order: 0 },
    ]);
    const res = await request(app).get('/api/history');
    expect(res.body.map((h) => h.text)).toEqual(['Birinchi', 'Ikkinchi']);
  });

  it('creates a history entry (admin only)', async () => {
    const res = await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${token}`)
      .send({ year: '2024', text: '5000+ baxtli mijoz', order: 4 });
    expect(res.status).toBe(201);
    expect(res.body.year).toBe('2024');
  });

  it('rejects creation without a token', async () => {
    const res = await request(app).post('/api/history').send({ year: '2024', text: 'X' });
    expect(res.status).toBe(401);
  });

  it('updates and deletes a history entry', async () => {
    const entry = await History.create({ year: '2017', text: 'Eski', order: 0 });

    const updateRes = await request(app)
      .put(`/api/history/${entry._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ year: '2017', text: 'Yangi', order: 0 });
    expect(updateRes.body.text).toBe('Yangi');

    const deleteRes = await request(app).delete(`/api/history/${entry._id}`).set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
    expect(await History.findById(entry._id)).toBeNull();
  });
});

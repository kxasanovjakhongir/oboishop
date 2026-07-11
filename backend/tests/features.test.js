const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const Feature = require('../models/Feature');
const { makeAdminToken } = require('./helpers');

let token;

beforeAll(async () => {
  await db.connect();
  token = await makeAdminToken();
});
afterEach(async () => Feature.deleteMany({}));
afterAll(async () => db.closeDatabase());

describe('Features', () => {
  it('lists features ordered by "order" then creation date', async () => {
    await Feature.create([
      { icon: '🎨', title: 'Ikkinchi', description: '...', order: 1 },
      { icon: '🏠', title: 'Birinchi', description: '...', order: 0 },
    ]);
    const res = await request(app).get('/api/features');
    expect(res.body.map((f) => f.title)).toEqual(['Birinchi', 'Ikkinchi']);
  });

  it('creates a feature (admin only)', async () => {
    const res = await request(app)
      .post('/api/features')
      .set('Authorization', `Bearer ${token}`)
      .send({ icon: '🚚', title: 'Tez yetkazish', description: '1-2 kun', order: 2 });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Tez yetkazish');
  });

  it('rejects creation without a token', async () => {
    const res = await request(app).post('/api/features').send({ icon: '🚚', title: 'X', description: 'Y' });
    expect(res.status).toBe(401);
  });

  it('updates and deletes a feature', async () => {
    const feature = await Feature.create({ icon: '💎', title: 'Eski', description: '...', order: 0 });

    const updateRes = await request(app)
      .put(`/api/features/${feature._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ icon: '💎', title: 'Yangi', description: '...', order: 0 });
    expect(updateRes.body.title).toBe('Yangi');

    const deleteRes = await request(app).delete(`/api/features/${feature._id}`).set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
    expect(await Feature.findById(feature._id)).toBeNull();
  });
});

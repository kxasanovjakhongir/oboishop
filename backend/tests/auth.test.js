const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const Admin = require('../models/Admin');

beforeAll(async () => db.connect());
afterEach(async () => db.clearDatabase());
afterAll(async () => db.closeDatabase());

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await Admin.create({ username: 'admin', password: 'admin123' });
  });

  it('issues a token for correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.username).toBe('admin');
  });

  it('rejects a wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('rejects an unknown username', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'nobody', password: 'admin123' });
    expect(res.status).toBe(401);
  });
});

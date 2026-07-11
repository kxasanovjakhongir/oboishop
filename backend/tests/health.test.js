const request = require('supertest');
const app = require('../app');
const db = require('./setup');

beforeAll(async () => db.connect());
afterAll(async () => db.closeDatabase());

describe('GET /health', () => {
  it('reports ok once the database is connected', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe('connected');
  });
});

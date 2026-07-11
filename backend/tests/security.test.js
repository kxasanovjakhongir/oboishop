const request = require('supertest');
const app = require('../app');
const db = require('./setup');

beforeAll(async () => db.connect());
afterAll(async () => db.closeDatabase());

describe('CORS', () => {
  it('allows a whitelisted origin', async () => {
    const res = await request(app).get('/api/wallpapers').set('Origin', 'http://localhost:3000');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('rejects a non-whitelisted origin with 403', async () => {
    const res = await request(app).get('/api/wallpapers').set('Origin', 'http://evil.example.com');
    expect(res.status).toBe(403);
  });
});

describe('security headers', () => {
  it('sets helmet defaults like X-Content-Type-Options', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('mongo-sanitize', () => {
  it('strips $ operators from query params instead of executing them', async () => {
    // A raw $ne injection would otherwise coerce into matching everything;
    // sanitized down to {}, it 400s on the ObjectId cast instead of leaking data.
    const res = await request(app).get('/api/reviews').query({ 'wallpaper[$ne]': 'null' });
    expect(res.status).not.toBe(200);
  });
});

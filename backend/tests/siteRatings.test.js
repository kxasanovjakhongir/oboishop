const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const SiteRating = require('../models/SiteRating');
const { makeAdminToken } = require('./helpers');

let token;

beforeAll(async () => {
  await db.connect();
  token = await makeAdminToken();
});
afterEach(async () => SiteRating.deleteMany({}));
afterAll(async () => db.closeDatabase());

describe('POST /api/site-ratings', () => {
  it('creates a rating', async () => {
    const res = await request(app).post('/api/site-ratings').send({ stars: 5, name: 'Anvar', comment: 'Zo\'r!' });
    expect(res.status).toBe(201);
    expect(res.body.stars).toBe(5);
    expect(res.body.featured).toBe(false);
  });
});

describe('GET /api/site-ratings/summary', () => {
  it('averages stars across all ratings', async () => {
    await SiteRating.create([{ stars: 5 }, { stars: 3 }]);
    const res = await request(app).get('/api/site-ratings/summary');
    expect(res.status).toBe(200);
    expect(res.body.average).toBe(4);
    expect(res.body.count).toBe(2);
  });

  it('returns zero when there are no ratings yet', async () => {
    const res = await request(app).get('/api/site-ratings/summary');
    expect(res.body).toEqual({ average: 0, count: 0 });
  });
});

describe('GET /api/site-ratings/featured', () => {
  it('only returns featured ratings that have a comment', async () => {
    await SiteRating.create([
      { stars: 5, comment: 'Yaxshi', featured: true },
      { stars: 4, comment: 'Featured emas', featured: false },
      { stars: 5, comment: '', featured: true }, // featured but no comment text
    ]);
    const res = await request(app).get('/api/site-ratings/featured');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].comment).toBe('Yaxshi');
  });
});

describe('PATCH /api/site-ratings/:id/feature', () => {
  it('toggles the featured flag (admin only)', async () => {
    const rating = await SiteRating.create({ stars: 5, comment: 'Ajoyib' });
    const res = await request(app)
      .patch(`/api/site-ratings/${rating._id}/feature`)
      .set('Authorization', `Bearer ${token}`)
      .send({ featured: true });
    expect(res.status).toBe(200);
    expect(res.body.featured).toBe(true);
  });

  it('requires an admin token', async () => {
    const rating = await SiteRating.create({ stars: 5, comment: 'Ajoyib' });
    const res = await request(app).patch(`/api/site-ratings/${rating._id}/feature`).send({ featured: true });
    expect(res.status).toBe(401);
  });
});

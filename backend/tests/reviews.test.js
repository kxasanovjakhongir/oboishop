const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const Review = require('../models/Review');
const Wallpaper = require('../models/Wallpaper');
const Category = require('../models/Category');
const { makeAdminToken } = require('./helpers');

let token;
let wallpaper;

beforeAll(async () => {
  await db.connect();
  token = await makeAdminToken();
});
afterEach(async () => {
  await Review.deleteMany({});
  await Wallpaper.deleteMany({});
  await Category.deleteMany({});
});
afterAll(async () => db.closeDatabase());

beforeEach(async () => {
  const category = await Category.create({ name: 'Kategoriya' });
  wallpaper = await Wallpaper.create({ name: 'Oboy', price: 100000, category: category._id });
});

describe('POST /api/reviews', () => {
  it('creates a review and recomputes the wallpaper rating', async () => {
    await request(app).post('/api/reviews').send({ wallpaper: wallpaper._id, name: 'Anvar', stars: 4, comment: 'Yaxshi' });
    await request(app).post('/api/reviews').send({ wallpaper: wallpaper._id, name: 'Vali', stars: 5, comment: 'Zo\'r' });

    const updated = await Wallpaper.findById(wallpaper._id);
    expect(updated.ratingCount).toBe(2);
    expect(updated.ratingAverage).toBe(4.5);
  });
});

describe('GET /api/reviews', () => {
  it('requires a wallpaper id', async () => {
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(400);
  });

  it('returns only reviews for the requested wallpaper', async () => {
    const category = await Category.findOne();
    const otherWallpaper = await Wallpaper.create({ name: 'Boshqa oboy', price: 50000, category: category._id });
    await Review.create({ wallpaper: wallpaper._id, name: 'A', stars: 5 });
    await Review.create({ wallpaper: otherWallpaper._id, name: 'B', stars: 3 });

    const res = await request(app).get('/api/reviews').query({ wallpaper: wallpaper._id.toString() });
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('A');
  });
});

describe('DELETE /api/reviews/:id', () => {
  it('deletes a review and recomputes the rating (admin only)', async () => {
    const review = await Review.create({ wallpaper: wallpaper._id, name: 'A', stars: 2 });
    await Wallpaper.findByIdAndUpdate(wallpaper._id, { ratingAverage: 2, ratingCount: 1 });

    const res = await request(app).delete(`/api/reviews/${review._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const updated = await Wallpaper.findById(wallpaper._id);
    expect(updated.ratingCount).toBe(0);
    expect(updated.ratingAverage).toBe(0);
  });
});

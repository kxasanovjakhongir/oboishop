const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const Wallpaper = require('../models/Wallpaper');
const Category = require('../models/Category');
const { makeAdminToken } = require('./helpers');

let token;
let categoryId;

beforeAll(async () => {
  await db.connect();
  token = await makeAdminToken();
});
afterEach(async () => {
  await Wallpaper.deleteMany({});
  await Category.deleteMany({});
});
afterAll(async () => db.closeDatabase());

beforeEach(async () => {
  const cat = await Category.create({ name: 'Test kategoriya' });
  categoryId = cat._id.toString();
});

describe('Wallpapers', () => {
  it('creates a wallpaper with an auto-generated sequential SKU', async () => {
    const res = await request(app)
      .post('/api/wallpapers')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Test oboy')
      .field('price', '150000')
      .field('category', categoryId);
    expect(res.status).toBe(201);
    expect(res.body.sku).toBe('OB-0001');
    expect(res.body.price).toBe(150000);
  });

  it('rejects creation without a required field (price)', async () => {
    const res = await request(app)
      .post('/api/wallpapers')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Narxsiz oboy')
      .field('category', categoryId);
    expect(res.status).toBe(400);
  });

  it('filters by category, price range, and search', async () => {
    const otherCat = await Category.create({ name: 'Boshqa' });
    await Wallpaper.create([
      { name: 'Gullar', price: 100000, category: categoryId },
      { name: 'Chiziqlar', price: 300000, category: categoryId },
      { name: 'Boshqa naqsh', price: 200000, category: otherCat._id },
    ]);

    const byCategory = await request(app).get('/api/wallpapers').query({ category: categoryId });
    expect(byCategory.body).toHaveLength(2);

    const byPrice = await request(app).get('/api/wallpapers').query({ minPrice: 150000 });
    expect(byPrice.body.map((w) => w.name).sort()).toEqual(['Boshqa naqsh', 'Chiziqlar']);

    const bySearch = await request(app).get('/api/wallpapers').query({ search: 'gul' });
    expect(bySearch.body).toHaveLength(1);
    expect(bySearch.body[0].name).toBe('Gullar');
  });

  it('only returns discounted wallpapers from /discounted', async () => {
    await Wallpaper.create([
      { name: 'Chegirmasiz', price: 100000, category: categoryId, discount: 0 },
      { name: 'Chegirmali', price: 100000, category: categoryId, discount: 20 },
    ]);
    const res = await request(app).get('/api/wallpapers/discounted');
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Chegirmali');
  });

  it('increments views when a single wallpaper is fetched', async () => {
    const w = await Wallpaper.create({ name: 'Ko\'rilgan', price: 50000, category: categoryId });
    await request(app).get(`/api/wallpapers/${w._id}`);
    await request(app).get(`/api/wallpapers/${w._id}`);
    const updated = await Wallpaper.findById(w._id);
    expect(updated.views).toBe(2);
  });

  it('toggles stock via the dedicated endpoint', async () => {
    const w = await Wallpaper.create({ name: 'Ombor', price: 50000, category: categoryId, stock: true });
    const res = await request(app)
      .put(`/api/wallpapers/${w._id}/stock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: false });
    expect(res.status).toBe(200);
    expect(res.body.stock).toBe(false);
  });

  it('deletes a wallpaper', async () => {
    const w = await Wallpaper.create({ name: "O'chiriladigan", price: 50000, category: categoryId });
    const res = await request(app).delete(`/api/wallpapers/${w._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(await Wallpaper.findById(w._id)).toBeNull();
  });
});

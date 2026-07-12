const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const Settings = require('../models/Settings');
const { makeAdminToken } = require('./helpers');

let token;

beforeAll(async () => {
  await db.connect();
  token = await makeAdminToken();
});
afterEach(async () => Settings.deleteMany({}));
afterAll(async () => db.closeDatabase());

describe('GET /api/settings', () => {
  it('creates a default settings document on first access', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    expect(res.body.siteName).toEqual(expect.any(String));
    expect(await Settings.countDocuments()).toBe(1);
  });

  it('reuses the same document on subsequent access instead of creating another', async () => {
    await request(app).get('/api/settings');
    await request(app).get('/api/settings');
    expect(await Settings.countDocuments()).toBe(1);
  });
});

describe('PUT /api/settings', () => {
  it('updates settings fields (admin only)', async () => {
    const res = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .field('siteName', 'OboiShop Yangilangan')
      .field('phone', '+998901112233');
    expect(res.status).toBe(200);
    expect(res.body.siteName).toBe('OboiShop Yangilangan');
  });

  it('requires an admin token', async () => {
    const res = await request(app).put('/api/settings').field('siteName', 'Hack');
    expect(res.status).toBe(401);
  });

  it('parses newline/comma-separated telegramChatIds into an array', async () => {
    const res = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .field('telegramBotToken', '123:abc')
      .field('telegramChatIds', '111\n222, 333\n\n444');
    expect(res.status).toBe(200);
    expect(res.body.telegramBotToken).toBe('123:abc');
    expect(res.body.telegramChatIds).toEqual(['111', '222', '333', '444']);
  });
});

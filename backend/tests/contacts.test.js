const request = require('supertest');
const app = require('../app');
const db = require('./setup');
const Contact = require('../models/Contact');
const { makeAdminToken } = require('./helpers');

let token;

beforeAll(async () => {
  await db.connect();
  token = await makeAdminToken();
});
afterEach(async () => Contact.deleteMany({}));
afterAll(async () => db.closeDatabase());

describe('POST /api/contacts', () => {
  it('accepts a public contact submission', async () => {
    const res = await request(app).post('/api/contacts').send({ name: 'Aziz', phone: '+998900000000', message: 'Salom' });
    expect(res.status).toBe(201);
    expect(await Contact.countDocuments()).toBe(1);
  });
});

describe('GET /api/contacts', () => {
  it('requires an admin token', async () => {
    const res = await request(app).get('/api/contacts');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/contacts/:id/read', () => {
  it('marks a contact as read', async () => {
    const contact = await Contact.create({ name: 'A', phone: '+998900000000', message: 'X' });
    const res = await request(app).put(`/api/contacts/${contact._id}/read`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.read).toBe(true);
  });
});

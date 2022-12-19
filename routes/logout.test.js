const request = require('supertest');
const app = require('../app');
const { createDB, closeDB } = require('../db/testDB');

beforeAll(async () => { await createDB() });
afterAll(async () => { await closeDB() });

test('cannot logout if not logged in', async () => {
  const res = await request(app).get('/logout');
  expect(res.statusCode).toEqual(302);
});

test('successfully logout', async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  const session = await request
    .agent(app)
    .post('/login')
    .send({ username: 'admin', password: 'admin' });

  const res = await request(app)
    .get('/logout')
    .set('Cookie', session.headers['set-cookie']);
    
  expect(res.headers['set-cookie']).not.toBe(session.headers['set-cookie']);
});

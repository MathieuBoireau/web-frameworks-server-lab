const request = require('supertest');
const app = require('../app');
const { createDB, closeDB } = require('../db/testDB')

beforeAll(async () => { await createDB() });
afterAll(async () => { await closeDB() });

test('get index', async()=> {
	const res = await request(app).get('/')
	expect(res.statusCode).toEqual(200)
});
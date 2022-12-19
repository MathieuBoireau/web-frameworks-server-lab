const request = require('supertest').agent;
const app = require('../app');
const {createDB,closeDB} = require('../db/testDB');

beforeAll(async () => { await createDB() });
afterAll(async () => { await closeDB() });

test('login get', async()=> {
	const res = await request(app)
		.get('/login')
	expect(res.statusCode).toEqual(200)
});

test('connect', async()=> {
	const res = await request(app)
		.post('/login')
		.send({username: 'admin', password: 'admin'})
	expect(res.statusCode).toEqual(302)
	expect(res.text).toEqual("Found. Redirecting to /")
});

test('connect with bad user values', async()=> {
	const res = await request(app)
		.post('/login')
		.send({username: 'non existent user', password: 'smthing'})
	expect(res.statusCode).toEqual(302)
	expect(res.text).toEqual("Found. Redirecting to /login?failure=yes")
});
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { Annonce } = require('../db/schema/annonce');
const { createDB, closeDB } = require('../db/testDB')

beforeAll(async () => { await createDB() });
afterEach(async () => {
  const annonces = mongoose.connection.collection('annonces');
  annonces.deleteMany();
});
afterAll(async () => { await closeDB() });

test('cannot access addAdvert without login', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  const res = await request(app).get('/addAdvert');
  expect(res.statusCode).toEqual(302);
});

test('access addAdvert as agent', async () => {
  const session = await request
    .agent(app)
    .post('/login')
    .send({ username: 'admin', password: 'admin' });

  const res = await request(app)
    .get('/addAdvert')
    .set('Cookie', session.headers['set-cookie']);

  expect(res.statusCode).toEqual(200);
});

test('POST addAdvert', async () => {
  const session = await request
    .agent(app)
    .post('/login')
    .send({ username: 'admin', password: 'admin' });

  const annonce = {
    title: 'Titre2',
    type: 'location',
    publication_status: 'non publiée',
    status: 'disponible',
    description: 'une description...2',
    price: 20000,
    date: new Date(0),
  };

  const res = await request(app)
    .post('/addAdvert')
    .set('Cookie', session.headers['set-cookie'])
    .send(annonce);

  const length = (await Annonce.find()).length;
  expect(length).toEqual(1);
});

test('POST addAdvert with errors', async () => {
  const session = await request
    .agent(app)
    .post('/login')
    .send({ username: 'admin', password: 'admin' });

  // title, price required
  const annonce = {
    title: '',
    type: 'location',
    publication_status: undefined,
    status: 'disponible',
    description: '...',
    price: '',
    date: '',
  };

  const res = await request(app)
    .post('/addAdvert')
    .set('Cookie', session.headers['set-cookie'])
    .send(annonce);

  const length = (await Annonce.find()).length;
  expect(length).toEqual(0);
  expect(res.text.includes('Titre requis')).toBeTruthy();
});

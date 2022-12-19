const request = require('supertest');
const app = require('../app');
const { createDB,closeDB, clearDB } = require('../db/testDB');
const fs = require('fs');
const path = require('path');
const testJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/json/annonces.json'), 'utf8'))
const { Annonce } = require('../db/schema/annonce');

let idAnnonce;

beforeAll(async () => {
	await createDB()
	const annonce = new Annonce(testJSON[0])
	await annonce.save()
	idAnnonce = annonce._id
});
afterAll(async () => { await closeDB() });

test('not found if no annonce_id', async () => {
	const res = await request(app).get('/annonces');
	expect(res.statusCode).toEqual(404);
});

test('no update, delete, ask and answer buttons without login', async () => {	
	const res = await request(app)
		.get('/annonces/'+idAnnonce)
	expect(res.statusCode).toEqual(200)
	expect(res.text).not.toContain("Mettre à jour</button>")
	expect(res.text).not.toContain("Supprimer l'annonce</button>")
	expect(res.text).not.toContain("Envoyer</button>")
	expect(res.text).not.toContain("Répondre</button>")
});

test('no update, delete and answer buttons with simple users', async () => {
	const session = await request.agent(app)
		.post('/login')
		.send({ username: 'oui', password: 'oui' });
	
	const res = await request(app)
		.get('/annonces/'+idAnnonce)
		.set('Cookie', session.headers['set-cookie']);
	expect(res.statusCode).toEqual(200);
	expect(res.text).not.toContain("Mettre à jour</button>")
	expect(res.text).not.toContain("Supprimer l'annonce</button>")
	expect(res.text).toContain("Envoyer</button>")
	expect(res.text).not.toContain("Répondre</button>")
});

test('no ask button with agent', async () => {
	const session = await request.agent(app)
		.post('/login')
		.send({ username: 'admin', password: 'admin' });
	
	const res = await request(app)
		.get('/annonces/'+idAnnonce)
		.set('Cookie', session.headers['set-cookie']);
	expect(res.statusCode).toEqual(200);
	expect(res.text).not.toContain("Envoyer</button>")
});

test('redirect non agents from not available adverts', async () => {
	await Annonce.findByIdAndUpdate(idAnnonce, { publication_status : 'non publiée' })
	// not connected
	let res = await request(app)
		.get('/annonces/'+idAnnonce)
	expect(res.text).toEqual("Found. Redirecting to /")
	//user connected
	const session = await request.agent(app)
		.post('/login')
		.send({ username: 'oui', password: 'oui' });
	
	res = await request(app)
		.get('/annonces/'+idAnnonce)
		.set('Cookie', session.headers['set-cookie']);
	expect(res.text).toEqual("Found. Redirecting to /")
});

test('check image', async () => {	
	const res = await request(app)
		.get('/annonces/'+idAnnonce+"/images/1")
	expect(res.statusCode).toEqual(200)
	expect(res.text).toEqual(undefined)
	expect(res.headers['content-type'].startsWith('image/')).toBe(true)
});

test('update', async () => {
	const session = await request.agent(app)
		.post('/login')
		.send({ username: 'admin', password: 'admin' });
	
	let annonceUpdated = {title:"Titre2", type:"location", publication_status:"non publiée",
		status:"disponible", description:"une description...2", price:20000, date:"2022-10-30T00:00:00.000Z"}
	
	const res = await request(app)
		.post('/annonces/'+idAnnonce)
		.set('Cookie', session.headers['set-cookie'])
		.send(annonceUpdated);
	expect(res.statusCode).toEqual(302);
	expect(res.text).toEqual("Found. Redirecting to /");
	const annonce = await Annonce.findById(idAnnonce);
	for(let key of Object.keys(annonceUpdated))
		if(key == "date")
			expect(annonce[key]).toEqual(new Date(annonceUpdated[key]));
		else
			expect(annonce[key]).toEqual(annonceUpdated[key]);
});

test('no update when errors', async () => {
	const session = await request.agent(app)
		.post('/login')
		.send({ username: 'admin', password: 'admin' });
	
	let annonceUpdated = {title:"", type:"location", publication_status:undefined,
		status:"disponible", description:"une description...2", price:20000, date:"2022-10-30T00:00:00.000Z"}
	
	const res = await request(app)
		.post('/annonces/'+idAnnonce)
		.set('Cookie', session.headers['set-cookie'])
		.send(annonceUpdated);
	expect(res.statusCode).toEqual(200);
	expect(res.text).toContain('Titre requis')
});

test('question user', async () => {
	const session = await request.agent(app)
		.post('/login')
		.send({ username: 'oui', password: 'oui' });
	
	const res = await request(app)
		.post('/annonces/'+idAnnonce+"/question")
		.set('Cookie', session.headers['set-cookie'])
		.send({text:"Une question"});
	expect(res.statusCode).toEqual(302);
	expect(res.text).toEqual("Found. Redirecting to /annonces/"+idAnnonce)
	const annonce = await Annonce.findById(idAnnonce)
	expect(annonce.questions[1].title).toEqual('Une question')
});

test('reponse agent', async () => {
	const session = await request.agent(app)
		.post('/login')
		.send({ username: 'admin', password: 'admin' });
	
	const res = await request(app)
		.post('/annonces/'+idAnnonce+"/question/1")
		.set('Cookie', session.headers['set-cookie'])
		.send({text:"Une réponse"});
	expect(res.statusCode).toEqual(302);
	expect(res.text).toEqual("Found. Redirecting to /annonces/"+idAnnonce)
	const annonce = await Annonce.findById(idAnnonce)
	expect(annonce.questions[1].answer.title).toEqual('Une réponse')
});

test('delete', async () => {
	const session = await request.agent(app)
		.post('/login')
		.send({ username: 'admin', password: 'admin' });
	
	const res = await request(app)
		.post('/annonces/'+idAnnonce+"/delete")
		.set('Cookie', session.headers['set-cookie'])
	expect(res.statusCode).toEqual(302);
	expect(res.text).toEqual("Found. Redirecting to /");
	const annonce = await Annonce.findById(idAnnonce);
	expect(annonce).toEqual(null);
});
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require('mongoose');
const User = require('./schema/user');

module.exports.createDB = async () => {
	await mongoose.connection.close();
	mongod = await MongoMemoryServer.create()
	const url = mongod.getUri();
	await mongoose
		.connect(url, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
	
	const users = [
		{ user: { username: 'oui', permission: 'user' }, password: 'oui' },
		{ user: { username: 'admin', permission: 'agent' }, password: 'admin' },
	];
	const promises = users.map((user) => User.register(user.user, user.password) );  
	await Promise.all(promises)
}

module.exports.clearDB = async () => {
	const collections = mongoose.connection.collections;
	for(const key in collections) {
		const collection = collections[key];
		await collection.deleteMany();
	}
}

module.exports.closeDB = async () => {
	await this.clearDB();
	await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
	await mongod.stop();
}
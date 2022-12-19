const UserDetails = require('./schema/user');

// test users
const users = [
  { user: { username: 'oui', permission: 'user' }, password: 'oui' },
  { user: { username: 'admin', permission: 'agent' }, password: 'admin' },
];

const promises = users.map((user) =>
  UserDetails.register(user.user, user.password)
);

Promise.all(promises)
  .then((e) => {
    console.log('Added users to database');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

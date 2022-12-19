var express = require('express');
var router = express.Router();
var connectEnsureLogin = require('connect-ensure-login');

/* Logout route */
router.get('/', connectEnsureLogin.ensureLoggedIn(), function (req, res, next) {
  req.logout((_) => console.log('Logout'));
  res.redirect('/');
});

module.exports = router;

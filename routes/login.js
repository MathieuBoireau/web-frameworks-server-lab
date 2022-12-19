var express = require('express');
var router = express.Router();
var passport = require('passport');
var connectEnsureLogin = require('connect-ensure-login');

/* GET login page */
router
  .get('/', connectEnsureLogin.ensureLoggedOut(), function (req, res, next) {
    res.render('login');
  })
  .post(
    '/',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login?failure=yes',
    })
  );

module.exports = router;

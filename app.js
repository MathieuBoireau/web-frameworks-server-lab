var createError = require('http-errors');
var express = require('express');
var session = require('express-session'); // sessions
var passport = require('passport'); // authentification
var path = require('path');
var cookieParser = require('cookie-parser'); // cookies
var logger = require('morgan'); // logging

// don't use db when running tests
if (process.env.JEST_WORKER_ID === undefined) {
  require('./db/db'); // mongodb connection
}
var User = require('./db/schema/user');

const routes = [
  { file: './routes/index', path: '/' },
  { file: './routes/annonces', path: '/annonces' },
  { file: './routes/addAdvert', path: '/addAdvert' },
  { file: './routes/login', path: '/login' },
  { file: './routes/logout', path: '/logout' },
];

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// session handler
app.use(session({
  secret: 'bigcat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 2 * 60 * 60 * 1000 } // 2 hours
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

for (const route of routes) {
  app.use(route.path, require(route.file));
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
// all packages
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var flash = require('express-flash');
var session = require('express-session');
var passport = require('passport');

// configure database in /lib/db.js
var connection = require('./lib/db');

// configure the router
var index_router = require('./routes/index');

// use dotenv (local configurations)
require('dotenv').config()

// initialise express
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// initialise all packages
app.use(logger('dev'));
app.use(express.json());

// allow getting information from forms (sign up & login)
app.use(express.urlencoded({ extended: false }));

// use cookie parser
app.use(cookieParser('secret'));

// set static directory
app.use(express.static(path.join(__dirname, 'public')));

// config session
app.use(session({
	cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
	saveUninitialized: false,
	resave: true,
	secret: 'secret'
}));

// enable flash messages
app.use(flash());

// config passport middleware
app.use(passport.initialize());
app.use(passport.session());

// initialise web routes
app.use('/', index_router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;

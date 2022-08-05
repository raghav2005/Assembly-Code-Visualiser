// all packages
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var flash = require('express-flash');
var session = require('express-session');
var mysql = require('mysql');
var connection = require('./lib/db');

// all routes
var index_router = require('./routes/index');
var login_router = require('./routes/login_sign_up/login');
var sign_up_router = require('./routes/login_sign_up/sign_up');

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

app.use(cookieParser());

// set static directory
app.use(express.static(path.join(__dirname, 'public')));

// session
app.use(session({
	cookie: { maxAge: 60000 },
	store: new session.MemoryStore,
	saveUninitialized: true,
	resave: 'true',
	secret: 'secret'
}))

app.use(flash());

// initialise all routes
app.use('/', index_router);
app.use('/login', login_router);
app.use('/sign_up', sign_up_router);

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

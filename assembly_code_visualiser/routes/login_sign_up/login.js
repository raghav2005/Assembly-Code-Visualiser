var express = require('express');
var router = express.Router();

// set up passport
var passport = require('passport');
var initializePassport = require('../../lib/passport-config');
var auth = require('../../lib/auth');

// for connecting to database
var db_connection = require('../../lib/db');

// coming from index page -> login
router.get('/', auth.check_not_authenticated, function (req, res, next) {
	res.locals.message = req.flash();
	res.render('login_sign_up/login', { title: 'Login', menu_id: 'login' });
});

// login form - student
router.post('/student', auth.check_not_authenticated, passport.authenticate('local_student', {
	failureRedirect: '/login',
	failureFlash: true,
	session: true
}), function(req, res) {
	// on successful authentication
	// if remember me box not ticked
	if (typeof req.body.remember_me === "undefined") {
		console.log('login max age (milliseconds): ' + req.session.cookie.maxAge.toString());
		res.redirect('/');
	} else {
		req.session.cookie.maxAge = 2592000000; // 30 days
		console.log('login max age (milliseconds): ' + req.session.cookie.maxAge.toString());
		res.redirect('/');
	}
});

// login form - teacher
router.post('/teacher', auth.check_not_authenticated, passport.authenticate('local_teacher', {
	failureRedirect: '/login',
	failureFlash: true,
	session: true
}), function (req, res) {
	// on successful authentication
	// if remember me box not ticked
	if (typeof req.body.remember_me === "undefined") {
		console.log('login max age (milliseconds): ' + req.session.cookie.maxAge.toString());
		res.redirect('/');
	} else {
		req.session.cookie.maxAge = 2592000000; // 30 days
		console.log('login max age (milliseconds): ' + req.session.cookie.maxAge.toString());
		res.redirect('/');
	}
});

module.exports = router;

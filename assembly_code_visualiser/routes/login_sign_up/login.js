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

router.post('/', auth.check_not_authenticated, passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

module.exports = router;

var express = require('express');
var router = express.Router();
var passport = require('passport');

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

// router.post('/', index_router.check_not_authenticated, function (req, res, next) {

// 	let email = req.body.email;
// 	let password = req.body.password;

// 	res.redirect('/');

// })

module.exports = router;

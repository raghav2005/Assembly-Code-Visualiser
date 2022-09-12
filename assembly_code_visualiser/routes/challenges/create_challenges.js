var express = require('express');
var router = express.Router();

var auth = require('../../lib/auth');

// for connecting to database
var db_connection = require('../../lib/db');

// coming to create_challenge page
router.get('/', auth.check_authenticated, function (req, res, next) {
	res.locals.message = req.flash();
	res.render('teacher_challenges/create_challenges', {
		title: 'Create Challenges',
		menu_id: 'create_challenges',
		role: req.user.role,
		email: req.user.email,
		session_id: req.sessionID,
		session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
	});
});

// coming to create_challenge page
router.get('/new_challenge', auth.check_authenticated, function (req, res, next) {
	res.locals.message = req.flash();
	res.render('teacher_challenges/new_challenge', {
		title: 'New Challenge',
		role: req.user.role,
		email: req.user.email,
		session_id: req.sessionID,
		session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
	});
});

// redirect to new_challenge page creation - testing stuffs
router.post('/new_challenge', function (req, res, next) {
	

	// code stuffs here
	console.log('new_challenge button clicked');

	// redirect to page to create a new challenge
	res.redirect('/create_challenges/new_challenge');

});

module.exports = router;

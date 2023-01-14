// all libs/modules
var express = require('express');
var router = express.Router();

var auth = require('../lib/auth');

/* GET home page. */
router.get('/', function(req, res, next) {

	console.log('req.user:', req.user);

	res.locals.message = req.flash();

	// no user
	if (typeof req.user == 'undefined') {
		res.render('index', {
			title: 'Home',
			menu_id: 'home',
			session_id: req.sessionID,
			session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
		});
	} else { // user exists
		res.render('index', {
			title: 'Home',
			menu_id: 'home',
			role: req.user.role,
			email: req.user.email,
			session_id: req.sessionID,
			session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
		});
	}

});

/* GET instruction set page */
router.get('/instruction_set', function (req, res, next) {

	res.locals.message = req.flash();

	if (typeof req.user == 'undefined') {
		res.render('instructions/instruction_set', {
			title: 'Instruction Set',
			menu_id: 'instruction_set',
		});
	} else {
		res.render('instructions/instruction_set', {
			title: 'Instruction Set',
			menu_id: 'instruction_set',
			role: req.user.role,
		});
	}
});

/* GET how to use page */
router.get('/how_to_use', function (req, res, next) {

	res.locals.message = req.flash();

	if (typeof req.user == 'undefined') {
		res.render('instructions/how_to_use', {
			title: 'How To Use This Resource',
			menu_id: 'how_to_use',
		});
	} else {
		res.render('instructions/how_to_use', {
			title: 'How To Use This Resource',
			menu_id: 'how_to_use',
			role: req.user.role,
		});
	}
});

/* POST logout button request */
router.post('/logout', function(req, res) {
	res.locals.message = req.flash();
	req.logout(function(err) {
		
		if (err) {
			console.log(err);
			return next(err);
		}

		// remove cookies and destroy session
		req.session.destroy((error) => {
			
			if (error) {
				console.log(error);
				return next(error);
			}
			
			res.redirect('/login');
		});
	});
});


module.exports = router;

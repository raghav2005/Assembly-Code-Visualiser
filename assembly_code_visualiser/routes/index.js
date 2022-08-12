var express = require('express');
var router = express.Router();

var auth = require('../lib/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
	
	// req.session.passport.user doesn't exist before authorisation
	// try {
	// 	console.log('req.session.passport.user:', req.session.passport.user);
	// } catch (err) {
	// 	console.log(err);
	// }

	console.log('req.user:', req.user);

	res.locals.message = req.flash();

	if (typeof req.user == 'undefined') {
		res.render('index', {
			title: 'Home',
			menu_id: 'home',
			session_id: req.sessionID,
			session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
		});
	} else {
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

router.post('/logout', function(req, res) {
	res.locals.message = req.flash();
	req.logout(function(err) {
		
		if (err) {
			console.log(err);
			return next(err);
		}

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

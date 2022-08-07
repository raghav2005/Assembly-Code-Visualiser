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
	res.render('index', { title: 'Home', menu_id: 'home' });
});

router.post('/logout', function(req, res) {
	res.locals.message = req.flash();
	req.logout(function(err) {
		if (err) {
			console.log(err);
			return next(err);
		}
		res.redirect('/login');
	})
})

module.exports = router;

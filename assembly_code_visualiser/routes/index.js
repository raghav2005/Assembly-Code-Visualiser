var express = require('express');
var router = express.Router();

var auth = require('../lib/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
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

var express = require('express');
var router = express.Router();

var auth = require('../lib/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.locals.message = req.flash();
	res.render('index', { title: 'Home', menu_id: 'home', name: req.user.student_name });
});

// router.delete('/logout', function(req, res) {
// 	res.locals.message = req.flash();
// 	req.logOut();
// 	res.redirect('/login');
// })

module.exports = router;

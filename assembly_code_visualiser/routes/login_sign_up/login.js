var express = require('express');
var router = express.Router();

// coming from index page -> login
router.get('/', function (req, res, next) {
	res.render('login_sign_up/login', { title: 'Login', menu_id: 'login_sign_up' });
});

module.exports = router;

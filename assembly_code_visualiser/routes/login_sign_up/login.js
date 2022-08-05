var express = require('express');
var router = express.Router();

// for connecting to database
var db_connection = require('../../lib/db');

// for decrypting password
var bcrypt = require('bcrypt');

// coming from index page -> login
router.get('/', function (req, res, next) {
	res.render('login_sign_up/login', { title: 'Login', menu_id: 'login' });
});

router.post('/', function (req, res, next) {

	let email = req.body.email;
	let password = req.body.password;

	res.redirect('/');

})

module.exports = router;

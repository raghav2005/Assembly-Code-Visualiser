var express = require('express');
var router = express.Router();
var passport = require('passport');

var auth = require('../../lib/auth');
// for connecting to database
var db_connection = require('../../lib/db');

// for decrypting password
var bcrypt = require('bcrypt');

// coming from index page -> sign_up
router.get('/', auth.check_not_authenticated, function (req, res, next) {
	res.locals.message = req.flash();
	res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' });
});

router.post('/', auth.check_not_authenticated, async function(req, res) {
	try {
		var hashed_password = await bcrypt.hash(req.body.password, 10);
		db_connection.query(
			'INSERT INTO Student (student_email, student_name, student_number, student_password) VALUES (?, ?, ?, ?);',
			[req.body.email, req.body.email.split('@')[0].slice(0, -4), req.body.email.split('@')[0].substr(-4), hashed_password],
			function (err, rows) {
				if (err) {
					console.log(err);
				}
				console.log(rows);
			}
		);
		db_connection.query(
			'INSERT INTO Students_In_Classes (student_id, class_id) VALUES ((SELECT student_id FROM Student WHERE student_email = ?), (SELECT class_id FROM Class WHERE year_group = ? AND teacher_id = (SELECT teacher_id FROM Teacher WHERE class_code = ?)));',
			[req.body.email, req.body.year_group, req.body.teacher_initials],
			function (err, rows) {
				if (err) {
					console.log(err);
				}
				console.log(rows);
			}
		);
		res.redirect('/login');
	} catch {
		res.redirect('/sign_up');
	}
});

// router.post('/', function (req, res, next) {

// 	let email = req.body.email;
// 	let year_group = req.body.year_group;
// 	let teacher_initials = req.body.teacher_initials;
// 	let password = req.body.password;
// 	let password_confirmation = req.body.password_confirmation;
// 	let errors = false;

// 	// all validation here (separate if statements for separate error messages)
// 	// any fields aren't filled out
// 	if (email.length === 0 || year_group.length === 0 || teacher_initials.length === 0 || password.length === 0 || password_confirmation.length === 0) {
// 		errors = true;
// 		req.flash('error', "Please complete the entire form");
// 		res.locals.message = req.flash();
// 		res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' })
// 	}

// 	// confirm password doesn't match password entered before
// 	if (password !== password_confirmation) {
// 		errors = true;
// 		req.flash('error', "Please enter the same password");
// 		res.locals.message = req.flash();
// 		res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' })
// 	}

// 	// if no errors
// 	if (!errors) {
	
// 		try {
// 			// 10 is a quick + relatively secure value for how many times to generate the hash
// 			var hashed_password = bcrypt.hash(password, 10);
// 		} catch {
// 			res.redirect('/sign_up');
// 		}

// 		res.redirect('/login');

// 	}

// })

module.exports = router;

var express = require('express');
var router = express.Router();
var passport = require('passport');

var auth = require('../../lib/auth');
// for connecting to database
var db_connection = require('../../lib/db');

// for decrypting password
var bcrypt = require('bcrypt');
const { format } = require('../../lib/db');

// coming from index page -> sign_up
router.get('/', auth.check_not_authenticated, function (req, res, next) {
	res.locals.message = req.flash();
	res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' });
});

// sign up form
router.post('/student', auth.check_not_authenticated, async function(req, res) {
	try {

		// all user-side scripting for validation
		var error_message = false;

		// ensure everything filled out
		if (req.body.email.length === 0) {
			error_message = true;
			req.flash('error', ' Email is required');
		}
		if (req.body.year_group.length === 0) {
			error_message = true;
			req.flash('error', ' Year Group is required');
		}
		if (req.body.teacher_initials.length === 0) {
			error_message = true;
			req.flash('error', ' Class is required');
		}
		if (req.body.password.length === 0) {
			error_message = true;
			req.flash('error', ' Password is required');
		}
		if (req.body.password_confirmation.length === 0) {
			error_message = true;
			req.flash('error', ' Confirm password is required');
		}

		// check email matches regex for student email
		var regex_student = /^[A-Za-z]+\d{4}\@dubaicollege.org$/;
		if (req.body.email.match(regex_student) === null) {
			error_message = true;
			req.flash('error', ' Invalid email format (DC email required)');
		}

		// ensure password length is >= 8 characters
		if (req.body.password.length < 8) {
			error_message = true;
			req.flash('error', ' Password length must be at least 8 characters');
		}

		// ensure password contains at least 1 alphabet, 1 number, and 1 special character
		var special_chars = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/; // regex for special characters
		var alphabet_chars = /[a-zA-Z]/; // regex for alphabets
		var number_chars = /\d/; // regex for digit
		if (!(special_chars.test(req.body.password) && alphabet_chars.test(req.body.password) && number_chars.test(req.body.password))) {
			error_message = true;
			req.flash('error', ' Password must contain at least 1 alphabet, 1 integer, and 1 special character');
		}

		// ensure confirm password is the same as password
		if (req.body.password !== req.body.password_confirmation) {
			error_message = true;
			req.flash('error', ' Confirm password does not match password');
		}

		// return with the error message
		if (error_message) {
			res.locals.message = req.flash();
			return res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' });
		}

		// all server-side scripting for validation

		// ensure email is not already being used
		db_connection.query(
			'SELECT * FROM Student WHERE student_email = ?;', [req.body.email],
			function (err, rows) {
				if (!rows || rows.length <= 0) {
					// good, do not want a result
					// pass - nothing needs to happen
				} else {
					// bad, 1 email cannot be used multiple times
					req.flash('error', ' Email is already being used');
					res.locals.message = req.flash();
					return res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' });
				}
			}
		);

		// validation complete, so add all data to the database
		var hashed_password = await bcrypt.hash(req.body.password, 10);
		db_connection.query(
			'INSERT INTO Student (student_email, student_name, student_number, student_password) VALUES (?, ?, ?, ?);',
			[req.body.email, req.body.email.split('@')[0].slice(0, -4), req.body.email.split('@')[0].substr(-4), hashed_password],
			function (err, rows) {
				if (err) {
					console.log(err);
					req.flash('error', ' An error occured');
					res.locals.message = req.flash();
					return res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' });
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
					req.flash('error', ' An error occured');
					res.locals.message = req.flash();
					return res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' });
				}
				console.log(rows);
			}
		);
		
		return res.redirect('/login');

	} catch {
		return res.redirect('/sign_up');
	}
});

// sign up form
router.post('/teacher', auth.check_not_authenticated, async function(req, res) {
	try {

		// all user-side scripting for validation
		var error_message = false;

		// ensure everything filled out
		if (req.body.email.length === 0) {
			error_message = true;
			req.flash('error', ' Email is required');
		}
		if (req.body.teacher_initials.length === 0) {
			error_message = true;
			req.flash('error', ' Class code is required');
		}
		if (req.body.password.length === 0) {
			error_message = true;
			req.flash('error', ' Password is required');
		}
		if (req.body.password_confirmation.length === 0) {
			error_message = true;
			req.flash('error', ' Confirm password is required');
		}

		// check email matches regex for student email
		var regex_teacher = /^[A-Za-z]+\.[A-Za-z]+\@dubaicollege.org$/;
		if (req.body.email.match(regex_teacher) === null) {
			error_message = true;
			req.flash('error', ' Invalid email format (DC email required)');
		}

		// ensure password length is >= 8 characters
		if (req.body.password.length < 8) {
			error_message = true;
			req.flash('error', ' Password length must be at least 8 characters');
		}

		// ensure password contains at least 1 alphabet, 1 number, and 1 special character
		var special_chars = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/; // regex for special characters
		var alphabet_chars = /[a-zA-Z]/; // regex for alphabets
		var number_chars = /\d/; // regex for digit
		if (!(special_chars.test(req.body.password) && alphabet_chars.test(req.body.password) && number_chars.test(req.body.password))) {
			error_message = true;
			req.flash('error', ' Password must contain at least 1 alphabet, 1 integer, and 1 special character');
		}

		// ensure confirm password is the same as password
		if (req.body.password !== req.body.password_confirmation) {
			error_message = true;
			req.flash('error', ' Confirm password does not match password');
		}

		// return with the error message
		if (error_message) {
			res.locals.message = req.flash();
			return res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' });
		}

		// all server-side scripting for validation

		// ensure email is not already being used
		db_connection.query(
			'SELECT * FROM Teacher WHERE teacher_email = ?;', [req.body.email],
			function (err, rows) {
				if (!rows || rows.length <= 0) {
					// good, do not want a result
					// pass - nothing needs to happen
				} else {
					// bad, 1 email cannot be used multiple times
					req.flash('error', ' Email is already being used');
					res.locals.message = req.flash();
					return res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' });
				}
			}
		);

		// ensure class code is not already being used
		db_connection.query(
			'SELECT * FROM Teacher WHERE class_code = ?;', [req.body.teacher_initials],
			function (err, rows) {
				if (!rows || rows.length <= 0) {
					// good, do not want a result
					// pass - nothing needs to happen
				} else {
					// bad, 1 email cannot be used multiple times
					req.flash('error', ' Class code is already being used');
					res.locals.message = req.flash();
					return res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' });
				}
			}
		);

		// validation complete, so add all data to the database
		var hashed_password = await bcrypt.hash(req.body.password, 10);
		db_connection.query(
			'INSERT INTO Student (student_email, student_name, student_number, student_password) VALUES (?, ?, ?, ?);',
			[req.body.email, req.body.email.split('@')[0].slice(0, -4), req.body.email.split('@')[0].substr(-4), hashed_password],
			function (err, rows) {
				if (err) {
					console.log(err);
					req.flash('error', ' An error occured');
					res.locals.message = req.flash();
					return res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' });
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
					req.flash('error', ' An error occured');
					res.locals.message = req.flash();
					return res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' });
				}
				console.log(rows);
			}
		);
		
		return res.redirect('/login');

	} catch {
		return res.redirect('/sign_up');
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

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

	try {
		
		// want all class_codes from the Teacher table to fill out the options for the student sign up
		db_connection.query(
			'SELECT class_code FROM Teacher;',
			function (err, rows) {
				
				if (err) {
					console.log(err);
					req.flash('error', ' An error occured');
					res.locals.message = req.flash();
					res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' });
				}

				if (rows.length === 0) {
					res.locals.message = req.flash();
					res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' });
				} else {
					// everything works
					res.locals.message = req.flash();
					res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up', class_codes: rows });
				}
			}
		);

	} catch (error) {
	
		res.locals.message = req.flash();
		res.render('login_sign_up/sign_up', { title: 'Sign Up', menu_id: 'sign_up' });

	}
});

// sign up form - student
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
			req.flash('error', ' Invalid email format (DC student email required)');
		}

		// ensure a teacher has signed up
		if (req.body.teacher_initials === 'no_teacher') {
			error_message = true;
			req.flash('error', ' A teacher needs to sign up first');
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
		// cross-parameterised SQL (tells MySQL exactly where the parameters are supposed to go (where the ? marks are))
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

// sign up form - teacher
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
			req.flash('error', ' Invalid email format (DC teacher email required)');
		}

		// ensure class code is 3 letters
		var regex_class_code = /^[A-Z]{3}$/;
		if (!(req.body.teacher_initials.match(regex_class_code))) {
			error_message = true;
			req.flash('error', ' Invalid class code format (3 capital letters)');
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
		// add teacher info to Teacher table
		var hashed_password = await bcrypt.hash(req.body.password, 10);
		db_connection.query(
			'INSERT INTO Teacher (teacher_email, teacher_first_name, teacher_last_name, class_code, teacher_password) VALUES (?, ?, ?, ?, ?);',
			[req.body.email, req.body.email.split('@')[0].split('.')[0].charAt(0).toUpperCase() + req.body.email.split('@')[0].split('.')[0].slice(1), req.body.email.split('@')[0].split('.')[1].charAt(0).toUpperCase() + req.body.email.split('@')[0].split('.')[1].slice(1), req.body.teacher_initials, hashed_password],
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
		// add 4 new classes (year 10-13 inclusive), with the teacher
		for (var year = 10; year <= 13; year++) {
			db_connection.query(
				'INSERT INTO Class (year_group, teacher_id) VALUES (?, (SELECT teacher_id FROM Teacher WHERE teacher_email = ?));',
				[year, req.body.email],
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
		}

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

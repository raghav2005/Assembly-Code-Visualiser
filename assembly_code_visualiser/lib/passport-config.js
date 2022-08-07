var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

var { body, validationResult } = require('express-validator');

// for connecting to database
var db_connection = require('./db');

function get_user_by_email(email) {
	db_connection.query(
		'SELECT * FROM Student WHERE student_email = ?;', [email],
		function (err, rows) {
			if (err) {
				console.log(err);
				return null;
			}
			console.log(rows[0]);
			return rows[0];
		}
	);
};

function initialize(passport) {
	console.log('Initialized Passport..!');

	passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function authenticateUser(req, email, password, done) {

		// all user-side scripting for validation
		body('email', 'Email is required').notEmpty();
		body('email', 'Invalid email format').isEmail();
		body('password', 'Password is required').notEmpty();
		body('password', 'Password length must be at least 8 characters').isLength({ min: 8 });

		var err = validationResult(req);

		if (!err.isEmpty()) {
			console.log('not here pls');
			return done(null, false, { message: err });
		}

		// all server-side scripting for validation
		db_connection.query(
			'SELECT * FROM `Student` WHERE `student_email` = ?;', [email],
			function (err, rows) {

				if (err) {
					console.log(err);
					return done(err);
				}

				if (!rows) {
					return done(null, false, { message: 'No user with that email' });
				}

				try {
					if (bcrypt.compare(password, rows[0].student_password)) {
						return done(null, rows)
					} else {
						return done(null, false, { message: 'Password incorrect' })
					}
				} catch (err) {
					return done(err)
				}
			}
		);
	}));

	passport.serializeUser(function(user, done) {
		process.nextTick(function() {
			done(null, { id: user.student_id, username: user.student_email });
		});
	});

	passport.deserializeUser(function(user, done) {
		process.nextTick(function() {
			return done(null, user);
		})
	});
};

module.exports = initialize

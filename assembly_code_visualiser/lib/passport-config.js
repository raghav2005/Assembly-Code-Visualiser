var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

var { body, validationResult } = require('express-validator');

// for connecting to database
var db_connection = require('./db');

var get_user_by_email = (email) => {
	return new Promise((resolve, reject) => {
		try {
			db_connection.query(
				'SELECT * FROM Student WHERE student_email = ?;', [email],
				function (err, rows) {

					if (err) {
						console.log(err);
						reject(err);
					}

					console.log(rows);

					resolve(rows);
				}
			);
		} catch (error) {
			reject(error);
		}
	});
};

function initialize(passport) {
	console.log('Initialized Passport..!');

	var authenticate_user = async (req, email, password, done) => {

		// all user-side scripting for validation
		body('email', 'Email is required').notEmpty();
		body('email', 'Invalid email format').isEmail();
		body('password', 'Password is required').notEmpty();
		body('password', 'Password length must be at least 8 characters').isLength({ min: 8 });

		var error = validationResult(req);

		if (!error.isEmpty()) {
			return done(null, false, { message: error });
		}

		// all server-side scripting for validation
		try {

			await get_user_by_email(email).then(async (rows) => {

				if (!rows) {
					return done(null, false, { message: 'No user with that email' });
				}

				try {

					if (await bcrypt.compare(password, rows[0].student_password)) {

						// everything correct from login
						rows[0].role = 'student';
						return done(null, rows[0])

					} else {
						console.log('pwd incorrect', password, rows[0].student_password);
						return done(null, false, { message: 'Password incorrect' })
					}

				} catch (err) {
					console.log(err);
					return done(err)
				}

			});
			
		} catch (error) {
			console.log(error);
			return done(null, false, { message: error });
		}

	};

	passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	authenticate_user));

	passport.serializeUser(function(user, done) {
		process.nextTick(function() {
			done(null, { id: user.student_id, email: user.student_email, role: user.role });
		});
	});

	passport.deserializeUser(function(user, done) {
		process.nextTick(function() {
			return done(null, user);
		})
	});
};

module.exports = initialize

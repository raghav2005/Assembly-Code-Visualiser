var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

// for connecting to database
var db_connection = require('./db');

var get_student_by_email = (email) => {
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

var get_teacher_by_email = (email) => {
	return new Promise((resolve, reject) => {
		try {
			db_connection.query(
				'SELECT * FROM Teacher WHERE teacher_email = ?;', [email],
				function (err, rows) {

					if (err) {
						console.log('1:', err);
						reject(err);
					}

					console.log('2:', rows);

					resolve(rows);
				}
			);
		} catch (error) {
			reject('3:', error);
		}
	});
};

function initialize(passport) {
	console.log('Initialized Passport..!');

	var authenticate_user_student = async (req, email, password, done) => {

		// all user-side scripting for validation

		// ensure everything filled out
		if (email.length === 0) {
			return done(null, false, { message: ' Email is required ' });
		}
		if (password.length === 0) {
			return done(null, false, { message: ' Password is required' });
		}

		// check email matches regex for student email
		var regex_student = /^[A-Za-z]+\d{4}\@dubaicollege.org$/;
		if (email.match(regex_student) === null) {
			return done(null, false, { message: ' Invalid email format (DC email required)' });
		}

		// ensure password length is >= 8 characters
		if (password.length < 8) {
			return done(null, false, { message: ' Password length must be at least 8 characters' });
		}

		// all server-side scripting for validation
		try {

			await get_student_by_email(email).then(async (rows) => {

				if (!rows || rows.length <= 0) {
					return done(null, false, { message: ' No user with that email' });
				}

				try {

					if (await bcrypt.compare(password, rows[0].student_password)) {
						// everything correct from login
						rows[0].role = 'student';
						return done(null, rows[0])
					} else {
						return done(null, false, { message: ' Password incorrect' })
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

	passport.use('local_student', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	authenticate_user_student));


	var authenticate_user_teacher = async (req, email, password, done) => {

		// all user-side scripting for validation

		// ensure everything filled out
		if (email.length === 0) {
			return done(null, false, { message: ' Email is required ' });
		}
		if (password.length === 0) {
			return done(null, false, { message: ' Password is required' });
		}

		// check email matches regex for teacher email
		var regex_teacher = /^[A-Za-z]+\.[A-Za-z]+\@dubaicollege.org$/;
		if (email.match(regex_teacher) === null) {
			return done(null, false, { message: ' Invalid email format (DC email required)' });
		}

		// ensure password length is >= 8 characters
		if (password.length < 8) {
			return done(null, false, { message: ' Password length must be at least 8 characters' });
		}

		// all server-side scripting for validation
		try {

			await get_teacher_by_email(email).then(async (rows) => {

				if (!rows || rows.length <= 0) {
					return done(null, false, { message: ' No user with that email' });
				}

				try {
					
					if (await bcrypt.compare(password, rows[0].teacher_password)) {
						// everything correct from login
						rows[0].role = 'teacher';
						return done(null, rows[0])
					} else {
						return done(null, false, { message: ' Password incorrect' })
					}

				} catch (err) {
					console.log('4:', err);
					return done(err)
				}

			});

		} catch (error) {
			console.log('5:', error);
			return done(null, false, { message: error });
		}

	};

	passport.use('local_teacher', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
		authenticate_user_teacher));


	passport.serializeUser(function(user, done) {
		process.nextTick(function() {
			if (user.role === 'student') {
				done(null, { id: user.student_id, email: user.student_email, role: user.role });
			} else {
				done(null, { id: user.teacher_id, email: user.teacher_email, role: user.role });
			}
		});
	});

	passport.deserializeUser(function(user, done) {
		process.nextTick(function() {
			return done(null, user);
		})
	});
};


module.exports = initialize

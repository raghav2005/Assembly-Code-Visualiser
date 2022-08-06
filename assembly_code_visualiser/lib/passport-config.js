var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
// for connecting to database
var db_connection = require('./db');

function get_user_by_email(email) {
	db_connection.query(
		`SELECT * FROM Student WHERE student_email = '${email}';`,
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

function get_user_by_id(id) {
	db_connection.query(
		`SELECT * FROM Student WHERE student_id = '${id}';`,
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

function initialize(passport, email, id) {
	var authenticateUser = async (email, password, done) => {
		
		var user = get_user_by_email(email);
		 
		if (user == null) {
			return done(null, false, {message: 'No user with that email'})
		}

		try {
			if (await bcrypt.compare(password, user.student_password)) {
				return done(null, user)
			} else {
				return done(null, false, {message: 'Password incorrect'})
			}
		} catch (err) {
			return done(err)
		}
	};

	passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
	passport.serializeUser((user, done) => done(null, user.student_id));
	passport.deserializeUser((id, done) => {
		return done(null, get_user_by_id(id))
	});
};

module.exports = initialize

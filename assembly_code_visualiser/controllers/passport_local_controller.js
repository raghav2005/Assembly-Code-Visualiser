var passport_local = require('passport-local');
var passport = require('passport');
var login_service = require('../services/login_service');

var local_strategy = passport_local.Strategy;

var init_passport_local = () => {
	
	passport.use(new local_strategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	
	async (req, email, password, done) => {

		try {
			
			await login_service.find_user_by_email(email).then(async (user) => {
				if (!user) {
					return done(null, false, req.flash('error', `This user email "${email}" does not exist`));
				}
				if (user) {
					var match = await login_service.compare_password(password, user);
					if (match === true) {
						return done(null, user, null)
					} else {
						return done(null, false, req.flash('error', match))
					}
				}
			});

		} catch (error) {
			console.log(error);
			return done(null, false, req.flash('error', error));
		}

	}));
};

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	login_service.find_user_by_id(id).then((user) => {
		return done(null, user);
	}).catch(error => {
		return done(error, null)
	});
});

module.exports = init_passport_local;

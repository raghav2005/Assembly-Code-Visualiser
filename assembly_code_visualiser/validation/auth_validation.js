var { check } = require('express-validator');

var validate_sign_up = [
	// TODO: all validation for the sign up page to go here
	check('email', 'Invalid email').isEmail().trim(),

	check('password', 'Invalid password: must be at least 8 characters long').isLength({ min: 8 }),

	check('password_confirmation', 'Password confirmation does not match password').custom((value, { req }) => {
		return value === req.body.password
	})
];

var validate_login = [
	// TODO: all validation for the login page to go here
	check('email', "Invalid email").isEmail().trim(),

	check('password', 'Invalid password').not().isEmpty()
];

module.exports = {
	validate_sign_up: validate_sign_up,
	validate_login: validate_login
};

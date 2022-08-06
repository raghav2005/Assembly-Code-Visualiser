var sign_up_service = require('./../services/sign_up_service');
var { validation_result } = require('express-validator');

var get_page_sign_up = (req, res) => {
	res.locals.message = req.flash();
	return res.render('login_sign_up/sign_up', {
		title: 'Sign Up',
		menu_id: 'sign_up'
	});
};

var create_new_user = async (req, res) => {
	
	// validate required fields
	var errors_array = [];
	var validation_errors = validation_result(req);

	if (!validation_errors.isEmpty()) {

		var errors = Object.values(validation_errors.mapped());

		errors.forEach((item) => {
			errors_array.push(item.msg);
		});

		req.flash('error', errors_array);
		res.locals.message = req.flash();

		return res.redirect('/sign_up');
	}

	// create a new user
	var new_user = {
		email: req.body.email,
		name: req.body.email.split('@')[0].slice(0, -4),
		number: req.body.email.split('@')[0].substr(-4),
		password: req.body.password,
		year_group: req.body.year_group,
		class_code: req.body.teacher_initials
	};

	try {
		await sign_up_service.create_new_user(new_user);
		return res.redirect('/login');
	} catch (error) {
		req.flash('error', error);
		return res.redirect('/sign_up');
	}
};

module.exports = {
	get_page_sign_up: get_page_sign_up,
	create_new_user: create_new_user
}

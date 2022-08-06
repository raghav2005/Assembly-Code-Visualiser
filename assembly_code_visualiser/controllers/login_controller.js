var { validation_result } = require('express-validator');
var login_service = require('../services/login_service');

var get_page_login = (req, res) => {
	res.locals.message = req.flash();
	return res.render('login_sign_up/login', {
		title: 'Login',
		menu_id: 'login'
	});
};

var handle_login = async (req, res) => {

	var errors_array = [];
	var validation_errors = validation_result(req);

	if (!validation_errors.isEmpty()) {
		
		var errors = Object.values(validation_errors.mapped());

		errors.forEach((item) => {
			errors_array.push(item.msg);
		});

		req.flash('error', errors_array);
		res.locals.message = req.flash();

		return res.redirect('/login');
	}

	try {
		await login_service.handle_login(req.body.email, req.body.password);
		return res.redirect('/');
	} catch (error) {
		req.flash('error', error);
		return res.redirect('/login');
	}
};

var check_logged_in = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.redirect('/');
	}
	next();
};

var check_logged_out = (req, res, next) => {
	if (req.isAuthenticated()) {
		return res.redirect('/');
	}
	next();
};

var post_log_out = (req, res) => {
	req.session.destroy(function(err) {
		return res.redirect('/login');
	});
};

module.exports = {
	get_page_login: get_page_login,
	handle_login: handle_login,
	check_logged_in: check_logged_in,
	check_logged_out: check_logged_out,
	post_log_out: post_log_out
}

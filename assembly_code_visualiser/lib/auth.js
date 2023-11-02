function check_authenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect('/login');
	}
};

function check_not_authenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/')
	} else {
		next();
	}
}


module.exports = {
	check_authenticated,
	check_not_authenticated
};

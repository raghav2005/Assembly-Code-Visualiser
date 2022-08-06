var express = require('express');
var router = express.Router();

var index_controller = require('../controllers/index_controller');
var sign_up_controller = require('../controllers/sign_up_controller');
var login_controller = require('../controllers/login_controller');

var auth = require('../validation/auth_validation');
var passport = require('passport');
var init_passport_local = require('../controllers/passport_local_controller');

// initialise passport everywhere
init_passport_local();

router.get('/', login_controller.check_logged_in(), function (req, res, next) {
	index_controller.handle_index_page();
});


router.get('/login', login_controller.check_logged_out, login_controller.get_page_login);

router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	successFlash: true,
	failureFlash: true
}));


router.get('/sign_up', sign_up_controller.get_page_sign_up);

router.post('/sign_up', auth.validate_sign_up, sign_up_controller.create_new_user);


router.post('/logout', login_controller.post_log_out);


module.exports = router;

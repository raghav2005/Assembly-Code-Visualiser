var express = require('express');
var router = express.Router();

var auth = require('../../lib/auth');

// for connecting to database
var db_connection = require('../../lib/db');

// for writing to files
var fs = require('fs');

// coming to create_challenge page
router.get('/', auth.check_authenticated, function (req, res, next) {

	res.locals.message = req.flash();

	res.render('teacher_challenges/create_challenges', {
		title: 'Create Challenges',
		menu_id: 'create_challenges',
		role: req.user.role,
		email: req.user.email,
		session_id: req.sessionID,
		session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
	});

});

// redirect to new_challenge page creation - testing stuffs
router.post('/new_challenge', function (req, res, next) {

	// code stuffs here
	console.log('new_challenge button clicked');

	// redirect to page to create a new challenge
	res.redirect('/create_challenges/new_challenge');

});

// coming to create_challenge page
router.get('/new_challenge', auth.check_authenticated, function (req, res, next) {

	res.locals.message = req.flash();

	res.render('teacher_challenges/new_challenge', {
		title: 'New Challenge',
		role: req.user.role,
		email: req.user.email,
		session_id: req.sessionID,
		session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
	});

});

// redirect to new_challenge page creation - testing stuffs
router.post('/new_challenge/create', function (req, res, next) {

	var create_challenge_file_path = './public/text_files/teacher_create_challenge.txt';
	var data = 'Hello !';

	// check if file exists
	
	// ASYNCHRONOUS
	// fs.access(create_challenge_file_path, fs.F_OK, (err) => {
	// 	if (err) {
	// 		console.error(err);
	// 		return;
	// 	};
	// 	// file exists
	// 	console.log('Teacher Create Challenge file already exists');
	// });

	// SYNCHRONOUS
	try {
		if (fs.existsSync(create_challenge_file_path)) {
			// file exists
			console.log('Teacher Create Challenge file already exists');
			
			try {
				fs.unlinkSync(create_challenge_file_path);
				// file removed
				console.log('Teacher Create Challenge file deleted');
			} catch (error) {
				console.error(error);
			};
		}
	} catch (err) {
		console.error(err);
	};


	fs.writeFile(create_challenge_file_path, data, 
	// callback function that is called after writing file is done
	function (err) {
		if (err) {
			console.log(err);
		};
		console.log('Data written to Teacher Create Challenge file successfully')
	});

	// redirect to page to create a new challenge
	res.redirect('/create_challenges');

});


module.exports = router;

var express = require('express');
var router = express.Router();

var auth = require('../../lib/auth');

// for connecting to database
var db_connection = require('../../lib/db');

// for writing to files
var fs = require('fs');

// coming to create_challenge page
router.get('/', auth.check_authenticated, function (req, res, next) {

	try {

		res.locals.message = req.flash();

		// record relation b/w teacher and challenge
		db_connection.query(
			'SELECT * FROM Challenge_File, Challenge_Teacher WHERE Challenge_File.challenge_file_id = Challenge_Teacher.challenge_file_id AND Challenge_Teacher.challenge_over_bool = 0;',
			[],
			function (err, rows) {

				if (err) {
					console.log(err);
					req.flash('error', ' An error occured');
					res.locals.message = req.flash();
				}

				console.log('rows start');
				console.log(rows);
				console.log('rows end');

				var challenges_to_display = [];
				var challenges_only = [];

				rows.forEach(element => {
					challenges_to_display.push([element['challenge_blob'].toString(), element['challenge_file_id']]);
					challenges_only.push(element['challenge_blob'].toString());
				});

				console.log('challenges_to_display start');
				console.log(challenges_to_display);
				console.log('challenges_to_display end');
				
				// challenges_to_display.forEach(element => {
				// 	challenge_titles.push(element.split('\n')[1]);
				// 	challenge_descriptions.push(element.split('\n')[3]);
				// });

				// console.log(challenge_titles);
				// console.log(challenge_descriptions);

				challenges_to_display.forEach((element_new, index) => {

					console.log('inside here start');
					console.log(element_new, index);

					var route_delete = '/delete/' + index.toString();

					router.post(route_delete, function (req, res, next) {

						console.log('hi start');
						console.log(element_new);
						console.log('hi end');

						// ! NOTE: THIS WORKS, EXCEPT WHEN THERE IS 1 REMAINING

						db_connection.query(
							'DELETE FROM Challenge_File WHERE challenge_file_id = ?;',
							[element_new[1]],
							function (err, rows) {
								if (err) {
									console.log(err);
									req.flash('error', ' An error occured');
									res.locals.message = req.flash();
									return res.redirect('/create_challenges');
								}
								console.log(rows);
							}
						);

						return res.redirect('/create_challenges');
					});

					var route_edit = '/edit/' + index.toString();

					router.post(route_edit, function (req, res, next) {

						console.log('hi 2 start');
						console.log(element_new);
						console.log('hi 2 end');

						res.locals.message = req.flash();

						res.render('teacher_challenges/edit_challenge', {
							title: 'Edit Challenge',
							role: req.user.role,
							email: req.user.email,
							session_id: req.sessionID,
							session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
							challenge_title: element_new[0].split('\n')[1].toString(),
							challenge_description: element_new[0].split('\n')[3].toString(),
							challenge_file_id: element_new[1].toString(),
						});

					});

					console.log('inside here end');

				});

				console.log('challenges_only start');
				console.log(challenges_only);
				console.log('challenges_only end');

				res.render('teacher_challenges/create_challenges', {
					title: 'Create Challenges',
					menu_id: 'create_challenges',
					role: req.user.role,
					email: req.user.email,
					// challenge_titles: challenge_titles,
					// challenge_descriptions: challenge_descriptions,
					challenges_to_display: challenges_only,
					session_id: req.sessionID,
					session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
				});

			}
		);
	
	} catch (any_error) {
		console.log(any_error);
		res.render('teacher_challenges/create_challenges', {
			title: 'Create Challenges',
			menu_id: 'create_challenges',
			role: req.user.role,
			email: req.user.email,
			session_id: req.sessionID,
			session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
		});
	}

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

// create new challenge and put in database
router.post('/new_challenge/create', function (req, res, next) {

	try {

		var create_challenge_file_path = './public/text_files/teacher_create_challenge.txt';

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

		// all user-side scripting for validation
		var error_message = false;

		// ensure everything filled out
		if (req.body.challenge_title.length === 0) {
			error_message = true;
			req.flash('error', ' Challenge Title is required');
		}
		if (req.body.challenge_description.length === 0) {
			error_message = true;
			req.flash('error', ' Challenge Description is required');
		}

		// ensure challenge title length is <= 100 characters
		if (req.body.challenge_title.length > 100) {
			error_message = true;
			req.flash('error', ' Challenge Title length must be max 100 characters');
		}

		// return with the error message
		if (error_message) {
			res.locals.message = req.flash();
			return res.render('teacher_challenges/new_challenge', {
				title: 'New Challenge',
				role: req.user.role,
				email: req.user.email,
				session_id: req.sessionID,
				session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
			});
		}

		var file_data = '###CHALLENGE TITLE###\n' + req.body.challenge_title.toString() + '\n###CHALLENGE DESCRIPTION###\n' + req.body.challenge_description.toString();
		fs.writeFileSync(create_challenge_file_path, file_data,
		// callback function that is called after writing file is done
		function (err) {
			if (err) {
				console.log(err);
			};
			console.log('Data written to Teacher Create Challenge file successfully')
		});

		var data_to_db = fs.readFileSync(create_challenge_file_path);

		// put file as MEDIUMBLOB in db
		db_connection.query(
			'INSERT INTO Challenge_File (challenge_blob) VALUES (?);',
			[data_to_db],
			function (err, rows) {
				if (err) {
					console.log(err);
					req.flash('error', ' An error occured');
					res.locals.message = req.flash();
					return res.render('teacher_challenges/new_challenge', {
						title: 'New Challenge',
						role: req.user.role,
						email: req.user.email,
						session_id: req.sessionID,
						session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
					});
				}
				console.log(rows);
			}
		);

		// record relation b/w teacher and challenge
		db_connection.query(
			'INSERT INTO Challenge_Teacher (challenge_file_id, teacher_id, challenge_over_bool) VALUES ((SELECT challenge_file_id FROM Challenge_File WHERE challenge_blob = ?), ?, ?);',
			[data_to_db, req.user.id, false],
			function (err, rows) {
				if (err) {
					console.log(err);
					req.flash('error', ' An error occured');
					res.locals.message = req.flash();
					return res.render('teacher_challenges/new_challenge', {
						title: 'New Challenge',
						role: req.user.role,
						email: req.user.email,
						session_id: req.sessionID,
						session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
					});
				}
				console.log(rows);
			}
		);

		// redirect to page to create a new challenge
		return res.redirect('/create_challenges');

	} catch (any_error) {
		res.locals.message = req.flash();
		return res.render('teacher_challenges/new_challenge', {
			title: 'New Challenge',
			role: req.user.role,
			email: req.user.email,
			session_id: req.sessionID,
			session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
		});
	}

});

// update the database for edited challenge
router.post('/edit/update', function (req, res, next) {

	try {

		var edit_challenge_file_path = './public/text_files/teacher_edit_challenge.txt';

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
			if (fs.existsSync(edit_challenge_file_path)) {
				// file exists
				console.log('Teacher Edit Challenge file already exists');

				try {
					fs.unlinkSync(edit_challenge_file_path);
					// file removed
					console.log('Teacher Edit Challenge file deleted');
				} catch (error) {
					console.error(error);
				};
			}
		} catch (err) {
			console.error(err);
		};

		// all user-side scripting for validation
		var error_message = false;

		// ensure everything filled out
		if (req.body.challenge_title.length === 0) {
			error_message = true;
			req.flash('error', ' Challenge Title is required');
		}
		if (req.body.challenge_description.length === 0) {
			error_message = true;
			req.flash('error', ' Challenge Description is required');
		}

		// ensure challenge title length is <= 100 characters
		if (req.body.challenge_title.length > 100) {
			error_message = true;
			req.flash('error', ' Challenge Title length must be max 100 characters');
		}

		// return with the error message
		if (error_message) {
			res.locals.message = req.flash();
			res.render('teacher_challenges/edit_challenge', {
				title: 'Edit Challenge',
				role: req.user.role,
				email: req.user.email,
				session_id: req.sessionID,
				session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
				challenge_title: req.body.challenge_title_og.toString(),
				challenge_description: req.body.challenge_description_og.toString(),
				challenge_file_id: req.body.challenge_file_id.toString(),
			});
		}

		var file_data = '###CHALLENGE TITLE###\n' + req.body.challenge_title.toString() + '\n###CHALLENGE DESCRIPTION###\n' + req.body.challenge_description.toString();
		fs.writeFileSync(edit_challenge_file_path, file_data,
			// callback function that is called after writing file is done
			function (err) {
				if (err) {
					console.log(err);
				};
				console.log('Data written to Teacher Create Challenge file successfully')
			});

		var data_to_db = fs.readFileSync(edit_challenge_file_path);

		// put file as MEDIUMBLOB in db
		db_connection.query(
			'UPDATE Challenge_File SET challenge_blob = ? WHERE challenge_file_id = ?;',
			[data_to_db, req.body.challenge_file_id],
			function (err, rows) {
				if (err) {
					console.log(err);
					req.flash('error', ' An error occured');
					res.locals.message = req.flash();
					return res.render('teacher_challenges/edit_challenge', {
						title: 'Edit Challenge',
						role: req.user.role,
						email: req.user.email,
						session_id: req.sessionID,
						session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
						challenge_title: req.body.challenge_title_og.toString(),
						challenge_description: req.body.challenge_description_og.toString(),
						challenge_file_id: req.body.challenge_file_id.toString(),
					});
				}
				console.log(rows);
			}
		);

		// redirect to page to create a new challenge
		return res.redirect('/create_challenges');

	} catch (any_error) {
		res.locals.message = req.flash();
		return res.render('teacher_challenges/edit_challenge', {
			title: 'Edit Challenge',
			role: req.user.role,
			email: req.user.email,
			session_id: req.sessionID,
			session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
			challenge_title: req.body.challenge_title_og.toString(),
			challenge_description: req.body.challenge_description_og.toString(),
			challenge_file_id: req.body.challenge_file_id.toString(),
		});
	}

});


module.exports = router;

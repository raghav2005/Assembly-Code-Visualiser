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
			'SELECT * FROM Challenge_File, Challenge_Teacher WHERE Challenge_File.challenge_file_id = Challenge_Teacher.challenge_file_id AND Challenge_Teacher.teacher_id = ?;',
			[req.user.id],
			function (err, rows) {

				if (err) {
					console.log(err);
					req.flash('error', ' An error occured');
					res.locals.message = req.flash();
				}

				// console.log('TRY QUERY FOR GETTING CLASSES + STUDENTS OF TEACHER');
				// console.log(req.user.email);
				// console.log(req.user.id);

				// store 2d list of [class (year + teacher id, e.g. 10RAW), class_id]
				var classes = [];

				// get classes of currently signed in teacher
				db_connection.query(
					'SELECT CONCAT(year_group, class_code), class_id FROM Class, Teacher WHERE Class.teacher_id = Teacher.teacher_id AND Class.teacher_id = ?;',
					[req.user.id],
					function (err_2, rows_2) {
						
						if (err_2) {
							console.log(err_2);
							req.flash('error', ' An error occured');
							res.locals.message = req.flash();
							return res.redirect('/create_challenges');
						}
						
						// console.log(rows_2);
						
						rows_2.forEach((element, index) => {
							classes.push([element['CONCAT(year_group, class_code)'], element['class_id']]);
						});

						// console.log('hi');
						// console.log(classes);

						// console.log('rows start');
						// console.log(rows);
						// console.log('rows end');

						// 2/3d list of [[class_id, [student1, student2, etc.]]]
						var class_students = [];

						classes.forEach((list_element, list_index) => {

							// console.log(list_element[1]);

							db_connection.query(
								'SELECT CONCAT(student_name, student_number) FROM Student, Students_In_Classes WHERE Student.student_id = Students_In_Classes.student_id AND class_id = ?;',
								[list_element[1]],
								function (err_3, rows_3) {
									
									if (err_3) {
										console.log(err_3);
										req.flash('error', ' An error occured');
										res.locals.message = req.flash();
										return res.redirect('/create_challenges');
									}

									// console.log(rows_3);

									var students = [];

									rows_3.forEach((element, index) => {
										students.push(element['CONCAT(student_name, student_number)']);
									});

									class_students.push([list_element[1], students]);
									// console.log(class_students);

									if (list_index == 3) {

										// console.log(classes);
										// console.log(class_students);
										
										var list_of_class_students = [];

										classes.forEach((element, index) => {
											list_of_class_students.push([classes[index][0], classes[index][1], class_students[index][1]]);
										});

										// console.log(list_of_class_students);

										var challenges_to_display = [];
										var challenges_only = [];

										rows.forEach(element => {
											challenges_to_display.push([element['challenge_blob'].toString(), element['challenge_file_id']]);
											challenges_only.push(element['challenge_blob'].toString());
										});

										// console.log('challenges_to_display start');
										// console.log(challenges_to_display);
										// console.log('challenges_to_display end');

										var challenge_title_match_id = [];

										challenges_to_display.forEach(element => {

											// separate challenge titles and descriptions
											// challenge_titles.push(element.split('\n')[1]);
											// challenge_descriptions.push(element.split('\n')[3]);

											// console.log('in forEach loop');

											// populate list of [challenge_title, challenge_file_id]
											challenge_title_match_id.push([element[0].split('\n')[1], element[1]]);
										});

										// console.log(challenge_title_match_id);

										// console.log(challenge_titles);
										// console.log(challenge_descriptions);

										challenges_to_display.forEach((element_new, index) => {

											// console.log('inside here start');
											// console.log(element_new, index);

											var route_delete = '/delete/' + index.toString();

											router.post(route_delete, function (req, res, next) {

												// console.log('hi start');
												// console.log(element_new);
												// console.log('hi end');

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
														// console.log(rows);
													}
												);

												return res.redirect('/create_challenges');
											});

											var route_edit = '/edit/' + index.toString();

											router.post(route_edit, function (req, res, next) {

												// console.log('hi 2 start');
												// console.log(element_new);
												// console.log('hi 2 end');

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

											// console.log('inside here end');

										});

										// console.log('challenges_only start');
										// console.log(challenges_only);
										// console.log('challenges_only end');

										res.render('teacher_challenges/create_challenges', {
											title: 'Create Challenges',
											menu_id: 'create_challenges',
											role: req.user.role,
											email: req.user.email,
											// challenge_titles: challenge_titles,
											// challenge_descriptions: challenge_descriptions,
											challenges_to_display: challenges_only,
											challenge_title_match_id: challenge_title_match_id,
											class_students: list_of_class_students,
											session_id: req.sessionID,
											session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
										});
									
									};

								}
							);

						});

					}

				);

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
			'INSERT INTO Challenge_Teacher (challenge_file_id, teacher_id) VALUES ((SELECT challenge_file_id FROM Challenge_File WHERE challenge_blob = ?), ?);',
			[data_to_db, req.user.id],
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

// assign challenges to students/classes
router.post('/assign', async function (req, res, next) {

	console.log('assign button clicked');


	// all vars to keep challenges + students updated
	var challenges_to_display = req.body.challenges_to_display.split(',').map(element => element.replace(/[\r]/gm, ''));
	
	var challenge_title_match_id = req.body.challenge_title_match_id.filter(element => element !== '')[0].split(',');
	challenge_title_match_id.forEach((element, index) => {
		if (index % 2 === 0) {
			// console.log(element, index)
			challenge_title_match_id[index] = [element.toString(), parseInt(challenge_title_match_id[index + 1])];
		} else {
			challenge_title_match_id[index] = '';
		};
	});
	challenge_title_match_id = challenge_title_match_id.filter(element => element !== '');

	var class_students = req.body.class_students.split('\n').filter(element => element !== '');
	class_students.filter(element => element !== '').forEach((element, index) => {
		class_students[index] = element.replace('\r', '').split(',');
		class_students[index].forEach((element_2, index_2) => {

			if (index_2 == 1) {
				class_students[index][index_2] = parseInt(element_2);
			}

			if (index_2 == 2) {
				if (element_2 == '') {
					class_students[index][index_2] = [];
				} else {
					class_students[index][index_2] = class_students[index].slice(2, class_students[index].length + 1);
				}
			}
		});

		class_students[index] = class_students[index].slice(0, 3);
	});


	try {

		var challenge_title_match_id_str = req.body.challenge_title_match_id.toString().split('thisisaveryspeficbreak').slice(0, -1);
		var challenge_title_match_id = [];
		for (var i = 0; i < challenge_title_match_id_str.length; i++) {
			if (i % 2 == 0) {
				challenge_title_match_id.push([challenge_title_match_id_str[i], challenge_title_match_id_str[i + 1]]);
			}
		};
		// console.log(challenge_title_match_id);

		// var students_to_assign = req.body.students_selected.split(' | ').filter(element => element !== '');
		var students_to_assign = req.body.students_selected_2.split(',').filter(element => element !== '');

		// console.log(students_to_assign);

		// all user-side scripting for validation
		var error_message = false;

		// ensure at least 1 student selected
		if (students_to_assign.length === 0 || students_to_assign === [] || typeof students_to_assign === "undefined") {
			error_message = true;
			req.flash('error', ' Select at least 1 student');
		}

		// return with the error message
		if (error_message) {
			res.locals.message = req.flash();
			return res.render('teacher_challenges/create_challenges', {
				title: 'Create Challenges',
				menu_id: 'create_challenges',
				role: req.user.role,
				email: req.user.email,
				challenges_to_display: challenges_to_display,
				challenge_title_match_id: challenge_title_match_id,
				class_students: class_students,
				session_id: req.sessionID,
				session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
			});
		} else {

			// ! success message thing

		}
		
	} catch (error) {
		console.log(error);
		// redirect to page to create a new challenge
		return res.render('teacher_challenges/create_challenges', {
			title: 'Create Challenges',
			menu_id: 'create_challenges',
			role: req.user.role,
			email: req.user.email,
			challenges_to_display: challenges_to_display,
			challenge_title_match_id: challenge_title_match_id,
			class_students: class_students,
			session_id: req.sessionID,
			session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
		});
	}

	// redirect to page to create a new challenge
	return res.render('teacher_challenges/create_challenges', {
		title: 'Create Challenges',
		menu_id: 'create_challenges',
		role: req.user.role,
		email: req.user.email,
		challenges_to_display: challenges_to_display,
		challenge_title_match_id: challenge_title_match_id,
		class_students: class_students,
		session_id: req.sessionID,
		session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
	});

});


module.exports = router;

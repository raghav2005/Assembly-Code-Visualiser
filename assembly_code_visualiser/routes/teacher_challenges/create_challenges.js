// TODO: FIX CHALLENGE EDIT BUTTON NOT WORKING, PERHAPS DO IT WITH THE ID RATHER THAN THE LIST INDEX!!!
// TODO: FIX CHALLENGE ASSIGNED WHEN NO STUDENTS SELECTED; SHOULD DISPLAY ERROR, BUT JUST GETTING STUCK

var express = require('express');
var router = express.Router();

var auth = require('../../lib/auth');

// for connecting to database
var db_connection = require('../../lib/db');

// for writing to files
var fs = require('fs');

// for array/list operations
var _ = require('lodash');

// coming to create_challenge page
router.get('/', auth.check_authenticated, async function (req, res, next) {

	try {

		res.locals.message = req.flash();

		await get_challenge_txt_and_id(req, res, next).then((row_challenge_txt_id) => {

			var challenges_to_display = [];
			// var challenges_only = [];

			row_challenge_txt_id.forEach(element => {
				challenges_to_display.push([element['challenge_blob'].toString(), element['challenge_teacher_id']]);
				// challenges_only.push(element['challenge_blob'].toString());
			});

			var challenge_title_match_id = [];

			challenges_to_display.forEach(element => {
				// populate list of [challenge_title, challenge_teacher_id]
				challenge_title_match_id.push([element[0].split('\n')[1], element[1]]);
			});

			// console.log('challenges_to_display');
			// console.log(challenges_to_display);
			// console.log('challenges_only');
			// console.log(challenges_only);
			// console.log('challenge_title_match_id');
			// console.log(challenge_title_match_id);

			return {
				'challenges_to_display': challenges_to_display,
				// 'challenges_only': challenges_only,
				'challenge_title_match_id': challenge_title_match_id
			};

		}).then(async (useful_vars) => {

			// store 2d list of [class (year + teacher id, e.g. 10RAW), class_id]
			var classes = [];

			await get_classes_of_teacher(req, res, next).then((row_classes_of_teacher) => {
				row_classes_of_teacher.forEach((element, index) => {
					classes.push([element['CONCAT(year_group, class_code)'], element['class_id']]);
				});
			});

			// console.log('classes');
			// console.log(classes);

			// console.log('challenges_to_display');
			// console.log(useful_vars['challenges_to_display']);
			// console.log('challenges_only');
			// console.log(useful_vars['challenges_only']);
			// console.log('challenge_title_match_id');
			// console.log(useful_vars['challenge_title_match_id']);

			useful_vars['classes'] = classes;

			return useful_vars;

		}).then(async (useful_vars) => {

			await get_students_in_teacher_classes(req, res, next, useful_vars).then((row_class_students) => {
				
				var list_of_class_students = [];

				useful_vars['classes'].forEach((element, index) => {
					list_of_class_students.push([useful_vars['classes'][index][0], useful_vars['classes'][index][1], row_class_students[index][1]]);
				});

				useful_vars['list_of_class_students'] = list_of_class_students;

			});

			console.log('challenges_to_display');
			console.log(useful_vars['challenges_to_display']);
			// console.log('challenges_only');
			// console.log(useful_vars['challenges_only']);
			console.log('challenge_title_match_id');
			console.log(useful_vars['challenge_title_match_id']);
			console.log('classes');
			console.log(useful_vars['classes']);
			console.log('list_of_class_students');
			console.log(useful_vars['list_of_class_students']);

			return useful_vars;
			
		}).then(async (useful_vars) => {

			useful_vars['challenges_to_display'].forEach(async (element, index) => {

				var route_delete = '/delete/' + element[1];

				router.post(route_delete, async function (req, res, next) {

					await delete_challenge(req, res, next, element).then(() => {
						return res.redirect('/create_challenges');
					});

				});

				var route_edit = '/edit/' + element[1];

				router.post(route_edit, async function (req, res, next) {

					res.locals.message = req.flash();

					res.render('teacher_challenges/edit_challenge', {
						title: 'Edit Challenge',
						role: req.user.role,
						email: req.user.email,
						session_id: req.sessionID,
						session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
						challenge_title: element[0].split('\n')[1].toString(),
						challenge_description: element[0].split('\n')[3].toString(),
						challenge_teacher_id: element[1].toString(),
					});

				});

			});

			res.render('teacher_challenges/create_challenges', {
				title: 'Create Challenges',
				menu_id: 'create_challenges',
				role: req.user.role,
				email: req.user.email,
				// challenge_titles: challenge_titles,
				// challenge_descriptions: challenge_descriptions,
				challenges_to_display: useful_vars['challenges_to_display'],
				challenge_title_match_id: useful_vars['challenge_title_match_id'],
				class_students: useful_vars['list_of_class_students'],
				session_id: req.sessionID,
				session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
			});

		});

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

var get_challenge_txt_and_id = (req, res, next) => {
	return new Promise((resolve, reject) => {
		try {

			// record relation b/w teacher and challenge
			db_connection.query(
				'SELECT * FROM Challenge_File, Challenge_Teacher WHERE Challenge_File.challenge_file_id = Challenge_Teacher.challenge_file_id AND Challenge_Teacher.teacher_id = ?;',
				[req.user.id],
				function (err, rows) {

					if (err) {
						console.log(err);
						req.flash('error', ' An error occured');
						res.locals.message = req.flash();
						reject(err);
					};

					resolve(rows);

				}
			);

		} catch (error) {
			reject(error);
		}
	});
};

var get_classes_of_teacher = (req, res, next) => {
	return new Promise((resolve, reject) => {
		try {

			// get classes of currently signed in teacher
			db_connection.query(
				'SELECT CONCAT(year_group, class_code), class_id FROM Class, Teacher WHERE Class.teacher_id = Teacher.teacher_id AND Class.teacher_id = ?;',
				[req.user.id],
				function (err, rows) {

					if (err) {
						console.log(err);
						req.flash('error', ' An error occured');
						res.locals.message = req.flash();
						return res.redirect('/create_challenges');
						reject(err)
					};

					resolve(rows);

				}
			);

		} catch (error) {
			reject(error);
		}
	});
};

var get_students_in_teacher_classes = async (req, res, next, useful_vars) => {
	return new Promise(async (resolve, reject) => {
		try {

			// 2/3d list of [[class_id, [student1, student2, etc.]]]
			var class_students = [];

			await useful_vars['classes'].forEach((list_element, list_index) => {

				get_student_in_specific_class(req, res, next, list_element[1]).then((row_students) => {

					var students = [];

					row_students.forEach((element, index) => {
						students.push(element['CONCAT(student_name, student_number)']);
					});

					class_students.push([list_element[1], students]);

					return class_students;

				}).then((class_students) => {
					if (list_index == useful_vars['classes'].length - 1) {
						resolve(class_students);
					};
				});

			});

		} catch (error) {
			reject(error);
		}
	});
};
var get_student_in_specific_class = async (req, res, next, teacher_class) => {
	return new Promise((resolve, reject) => {
		try {

			// get classes of currently signed in teacher
			db_connection.query(
				'SELECT CONCAT(student_name, student_number) FROM Student, Students_In_Classes WHERE Student.student_id = Students_In_Classes.student_id AND class_id = ?;',
				[teacher_class],
				function (err, rows) {

					if (err) {
						console.log(err);
						req.flash('error', ' An error occured');
						res.locals.message = req.flash();
						return res.redirect('/create_challenges');
						reject(err)
					};

					resolve(rows);

				}
			);

		} catch (error) {
			reject(error);
		}
	});
};

var delete_challenge = (req, res, next, challenges_to_display_element) => {
	return new Promise((resolve, reject) => {
		try {

			// get classes of currently signed in teacher
			db_connection.query(
				'DELETE FROM Challenge_File WHERE challenge_file_id = (SELECT challenge_file_id FROM Challenge_Teacher WHERE challenge_teacher_id = ?);',
				[challenges_to_display_element[1]],
				function (err, rows) {

					if (err) {
						console.log(err);
						req.flash('error', ' An error occured');
						res.locals.message = req.flash();
						return res.redirect('/create_challenges');
						reject(err)
					};

					resolve(rows);

				}
			);

		} catch (error) {
			reject(error);
		}
	});
};

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
				challenge_teacher_id: req.body.challenge_teacher_id.toString(),
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
			'UPDATE Challenge_File SET challenge_blob = ? WHERE challenge_file_id = (SELECT challenge_file_id FROM Challenge_Teacher WHERE challenge_teacher_id = ?);',
			[data_to_db, req.body.challenge_teacher_id],
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
						challenge_teacher_id: req.body.challenge_teacher_id.toString(),
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
			challenge_teacher_id: req.body.challenge_teacher_id.toString(),
		});
	}

});

// assign challenges to students/classes
router.post('/assign', async function (req, res, next) {

	console.log('assign button clicked');

	var challenges_to_display_temp = req.body.challenges_to_display.toString().split('###CHALLENGE TITLE###').map(element => element.replace(/[\r]/gm, '')).filter(element => element !== '');
	// all vars to keep challenges + students updated
	var challenges_to_display = [];
	challenges_to_display_temp.forEach((element, index) => {
		if (index !== challenges_to_display_temp.length - 1) {
			challenges_to_display.push(['###CHALLENGE TITLE###' + element.slice(0, - 2 - element.split(',').reverse()[1].length), parseInt(element.split(',').reverse()[1])]);
		} else {
			challenges_to_display.push(['###CHALLENGE TITLE###' + element.slice(0, - 1 - element.split(',').reverse()[0].length), parseInt(element.split(',').reverse()[0])]);
		};
	});

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

	// var students_to_assign = req.body.students_selected.split(' | ').filter(element => element !== '');
	var students_to_assign = req.body.students_selected_2.split(',').filter(element => element !== '');
	var due_date = new Date(req.body.due_date);
	var today = new Date();


	try {

		// all user-side scripting for validation
		var error_message = false;

		// ensure at least 1 student selected
		if (students_to_assign.length === 0 || students_to_assign === [] || typeof students_to_assign === "undefined") {
			error_message = true;
			req.flash('error', ' Select at least 1 student');
		}

		// due date must be > 24 hours away from current time
		if (due_date.getTime() <= new Date(today.getTime() + 60 * 60 * 24 * 1000).getTime()) {
			error_message = true;
			req.flash('error', ' Due date must be at least 24 hours after current time');
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
		}

		var student_ids_assigned_this_challenge_already = [];
		var student_names_assigned_this_challenge_already = [];

		await get_students_already_assigned_challenge(req, res, next, challenges_to_display, challenge_title_match_id, class_students).then((rows) => {
			rows.forEach((element, index) => {
				student_ids_assigned_this_challenge_already.push([element['CONCAT(Student.student_name, Student.student_number)'], element['student_id']]);
			});
		}).then(() => {

			student_ids_assigned_this_challenge_already.forEach((element, index) => {
				student_names_assigned_this_challenge_already.push(element[0]);
			});

			var contains_1 = student_names_assigned_this_challenge_already.some(element => {
				return students_to_assign.includes(element);
			});
			var contains_2 = students_to_assign.some(element => {
				return student_names_assigned_this_challenge_already.includes(element);
			});

			if (contains_1 == true || contains_2 == true) {
				error_message = true;
				req.flash('error', ' At least 1 student has already been assigned this challenge!');
			};

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

				students_to_assign.forEach((element, index) => {
					// record relation b/w teacher and challenge
					db_connection.query(
						'INSERT INTO Assigned_Challenges (challenge_teacher_id, student_id, due_date) VALUES (?, (SELECT student_id FROM Student WHERE student_name = ? AND student_number = ?), ?);',
						[challenge_title_match_id[_.findIndex(challenge_title_match_id, function (el) { return el[0] == req.body.assign_challenge_dd })][1], element.slice(0, -4), element.slice(-4), due_date.toISOString().slice(0, 19).replace('T', ' ')],
						function (err, rows) {
							if (err) {
								console.log(err);
								req.flash('error', ' An error occured');
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
							}
							// console.log(rows);
						}
					);
				});

				req.flash('success', ' Assigned challenge to student(s)');
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

			}

		});

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
	};
});

var get_students_already_assigned_challenge = (req, res, next, challenges_to_display, challenge_title_match_id, class_students) => {
	return new Promise((resolve, reject) => {
		try {

			db_connection.query(
				'SELECT CONCAT(Student.student_name, Student.student_number), Student.student_id FROM Assigned_Challenges, Challenge_Teacher, Student WHERE Assigned_Challenges.challenge_teacher_id = Challenge_Teacher.challenge_teacher_id AND Assigned_Challenges.student_id = Student.student_id AND Assigned_Challenges.challenge_teacher_id = (SELECT challenge_teacher_id FROM Challenge_Teacher WHERE teacher_id = ? AND challenge_file_id = ?);',
				[req.user.id, challenge_title_match_id[_.findIndex(challenge_title_match_id, function (el) { return el[0] == req.body.assign_challenge_dd })][1]],
				function (err, rows) {

					if (err) {
						console.log(err);
						req.flash('error', ' An error occured');
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
						reject(err)
					}

					resolve(rows);

				}
			);

		} catch (error) {
			reject(error);
		}
	});
}


module.exports = router;

var express = require('express');
var router = express.Router();

var auth = require('../../lib/auth');

// for connecting to database
var db_connection = require('../../lib/db');

// for writing to files
var fs = require('fs');

// for array/list operations
var _ = require('lodash');

// for DATETIME conversions
var moment = require('moment');
moment.locale('en-gb');
moment.defaultFormat = 'L LT';
var utc_datetime = moment.utc().format();

// coming to create_challenge page
router.get('/', auth.check_authenticated, async function (req, res, next) {

	try {

		res.locals.message = req.flash();

		await get_all_solved_unsolved_challenges(req, res, next, true).then((rows) => {

			var all_completed_challenges = [];

			rows.forEach(element => {
				all_completed_challenges.push([element['challenge_blob'].toString(), element['challenge_teacher_id'], moment(element['due_date']).utc(utc_datetime).local().format(), moment(element['completion_date']).utc(utc_datetime).local().format()]);
			});

			console.log('all_completed_challenges');
			console.log(all_completed_challenges);

			return {
				'all_completed_challenges': all_completed_challenges
			};

		}).then(async (useful_vars) => {

			await get_all_unsolved_due_before_after_curr_date_challenges(req, res, next, true).then((rows) => {
			
				var all_missed_challenges = [];

				rows.forEach(element => {
					all_missed_challenges.push([element['challenge_blob'].toString(), element['challenge_teacher_id'], moment(element['due_date']).utc(utc_datetime).local().format()]);
				});

				console.log('all_missed_challenges');
				console.log(all_missed_challenges);

				useful_vars['all_missed_challenges'] = all_missed_challenges;
				
			});

			return useful_vars;

		}).then(async (useful_vars) => {

			await get_all_unsolved_due_before_after_curr_date_challenges(req, res, next, false).then((rows) => {

				var all_challenges_to_do = [];

				rows.forEach(element => {
					all_challenges_to_do.push([element['challenge_blob'].toString(), element['challenge_teacher_id'], moment(element['due_date']).utc(utc_datetime).local().format()]);
				});

				console.log('all_challenges_to_do');
				console.log(all_challenges_to_do);

				useful_vars['all_challenges_to_do'] = all_challenges_to_do;

			});

			return useful_vars;

		}).then((useful_vars) => {

			useful_vars['all_challenges_to_do'].forEach(async (element, index) => {

				var route_complete = '/complete_challenge/' + element[1];

				router.post(route_complete, async function (req, res, next) {

					res.locals.message = req.flash();

					res.render('student_challenges/complete_challenge', {
						title: 'Complete Challenge',
						role: req.user.role,
						email: req.user.email,
						session_id: req.sessionID,
						session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
						challenge_title: element[0].split('\n')[1].toString(),
						challenge_description: element[0].split('\n')[3].toString(),
						assigned_challenge_id: element[1].toString()
					});

				});

			});

			return res.render('student_challenges/view_set_challenges', {
				title: 'View Set Challenges',
				menu_id: 'view_set_challenges',
				role: req.user.role,
				email: req.user.email,
				all_completed_challenges: useful_vars['all_completed_challenges'],
				all_missed_challenges: useful_vars['all_missed_challenges'],
				all_challenges_to_do: useful_vars['all_challenges_to_do'],
				session_id: req.sessionID,
				session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
			});

		});
		
	} catch (any_error) {
		console.log(any_error);
		res.render('student_challenges/view_set_challenges', {
			title: 'View Set Challenges',
			menu_id: 'view_set_challenges',
			role: req.user.role,
			email: req.user.email,
			session_id: req.sessionID,
			session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
		});
	}

});

var get_all_unsolved_due_before_after_curr_date_challenges = (req, res, next, before) => {
	return new Promise((resolve, reject) => {
		try {

			// get all challenges that were due before the current date - i.e. missed
			if (before) {
				var query_to_run = 'SELECT * FROM Challenge_File, Challenge_Teacher, Assigned_Challenges WHERE Challenge_File.challenge_file_id = Challenge_Teacher.challenge_file_id AND Challenge_Teacher.challenge_teacher_id = Assigned_Challenges.challenge_teacher_id AND Assigned_Challenges.student_id = ? AND Assigned_Challenges.assigned_challenge_id NOT IN (SELECT Solution_Student.assigned_challenge_id FROM Solution_Student, Assigned_Challenges WHERE Solution_Student.assigned_challenge_id = Assigned_Challenges.assigned_challenge_id) AND Assigned_Challenges.due_date <= NOW() ORDER BY Assigned_Challenges.due_date ASC;';
			} else { // all challenges that can still be solved by the student, the due date is after the current time
				var query_to_run = 'SELECT * FROM Challenge_File, Challenge_Teacher, Assigned_Challenges WHERE Challenge_File.challenge_file_id = Challenge_Teacher.challenge_file_id AND Challenge_Teacher.challenge_teacher_id = Assigned_Challenges.challenge_teacher_id AND Assigned_Challenges.student_id = ? AND Assigned_Challenges.assigned_challenge_id NOT IN (SELECT Solution_Student.assigned_challenge_id FROM Solution_Student, Assigned_Challenges WHERE Solution_Student.assigned_challenge_id = Assigned_Challenges.assigned_challenge_id) AND Assigned_Challenges.due_date > NOW() ORDER BY Assigned_Challenges.due_date ASC;';
			};

			db_connection.query(
				query_to_run,
				[req.user.id],
				function (err, rows) {

					if (err) {
						console.log(err);
						req.flash('error', ' An error occured');
						res.locals.message = req.flash();
						return res.render('student_challenges/view_set_challenges', {
							title: 'View Set Challenges',
							menu_id: 'view_set_challenges',
							role: req.user.role,
							email: req.user.email,
							session_id: req.sessionID,
							session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
						});
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
var get_all_solved_unsolved_challenges = (req, res, next, solved) => {
	return new Promise((resolve, reject) => {
		try {

			if (solved) {
				var query_to_run = 'SELECT * FROM Challenge_File, Challenge_Teacher, Assigned_Challenges, Solution_Student WHERE Challenge_File.challenge_file_id = Challenge_Teacher.challenge_file_id AND Challenge_Teacher.challenge_teacher_id = Assigned_Challenges.challenge_teacher_id AND Solution_Student.assigned_challenge_id = Assigned_Challenges.assigned_challenge_id AND Assigned_Challenges.student_id = ? AND Assigned_Challenges.assigned_challenge_id IN (SELECT Solution_Student.assigned_challenge_id FROM Solution_Student, Assigned_Challenges WHERE Solution_Student.assigned_challenge_id = Assigned_Challenges.assigned_challenge_id) ORDER BY Assigned_Challenges.due_date ASC;';
			} else {
				var query_to_run = 'SELECT * FROM Challenge_File, Challenge_Teacher, Assigned_Challenges WHERE Challenge_File.challenge_file_id = Challenge_Teacher.challenge_file_id AND Challenge_Teacher.challenge_teacher_id = Assigned_Challenges.challenge_teacher_id AND Assigned_Challenges.student_id = ? AND Assigned_Challenges.assigned_challenge_id NOT IN (SELECT Solution_Student.assigned_challenge_id FROM Solution_Student, Assigned_Challenges WHERE Solution_Student.assigned_challenge_id = Assigned_Challenges.assigned_challenge_id) ORDER BY Assigned_Challenges.due_date ASC;';
			};

			db_connection.query(
				query_to_run,
				[req.user.id],
				function (err, rows) {

					if (err) {
						console.log(err);
						req.flash('error', ' An error occured');
						res.locals.message = req.flash();
						return res.render('student_challenges/view_set_challenges', {
							title: 'View Set Challenges',
							menu_id: 'view_set_challenges',
							role: req.user.role,
							email: req.user.email,
							session_id: req.sessionID,
							session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
						});
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
var get_all_assigned_challenges = (req, res, next) => {
	return new Promise((resolve, reject) => {
		try {

			db_connection.query(
				'SELECT * FROM Challenge_File, Challenge_Teacher, Assigned_Challenges WHERE Challenge_File.challenge_file_id = Challenge_Teacher.challenge_file_id AND Challenge_Teacher.challenge_teacher_id = Assigned_Challenges.challenge_teacher_id AND Assigned_Challenges.student_id = ? ORDER BY Assigned_Challenges.due_date ASC;',
				[req.user.id],
				function (err, rows) {

					if (err) {
						console.log(err);
						req.flash('error', ' An error occured');
						res.locals.message = req.flash();
						return res.render('student_challenges/view_set_challenges', {
							title: 'View Set Challenges',
							menu_id: 'view_set_challenges',
							role: req.user.role,
							email: req.user.email,
							session_id: req.sessionID,
							session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
						});
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

// create new challenge and put in database
router.post('/complete_challenge/complete', function (req, res, next) {

	try {

		var complete_challenge_file_path = './public/text_files/student_complete_challenge.txt';

		// check if file exists

		// ASYNCHRONOUS
		// fs.access(complete_challenge_file_path, fs.F_OK, (err) => {
		// 	if (err) {
		// 		console.error(err);
		// 		return;
		// 	};
		// 	// file exists
		// 	console.log('Teacher Create Challenge file already exists');
		// });

		// SYNCHRONOUS
		try {
			if (fs.existsSync(complete_challenge_file_path)) {
				// file exists
				console.log('Student Complete Challenge file already exists');

				try {
					fs.unlinkSync(complete_challenge_file_path);
					// file removed
					console.log('Student Complete Challenge file deleted');
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
		if (req.body.challenge_answer.length === 0) {
			error_message = true;
			req.flash('error', ' Challenge Answer is required');
		}

		// return with the error message
		if (error_message) {
			res.locals.message = req.flash();
			return res.render('student_challenges/view_set_challenges', {
				title: 'View Set Challenges',
				menu_id: 'view_set_challenges',
				role: req.user.role,
				email: req.user.email,
				session_id: req.sessionID,
				session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
			});
		}

		var file_data = req.body.challenge_answer.toString();
		fs.writeFileSync(complete_challenge_file_path, file_data,
			// callback function that is called after writing file is done
			function (err) {
				if (err) {
					console.log(err);
				};
				console.log('Data written to Student Complete Challenge file successfully')
			});

		var data_to_db = fs.readFileSync(complete_challenge_file_path);

		// put file as MEDIUMBLOB in db
		db_connection.query(
			'INSERT INTO Solution_File (solution_blob) VALUES (?);',
			[data_to_db],
			function (err, rows) {
				if (err) {
					console.log(err);
					req.flash('error', ' An error occured');
					res.locals.message = req.flash();
					return res.render('student_challenges/view_set_challenges', {
						title: 'View Set Challenges',
						menu_id: 'view_set_challenges',
						role: req.user.role,
						email: req.user.email,
						session_id: req.sessionID,
						session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
					});
				}
				console.log(rows);
			}
		);

		// record relation b/w student and solution
		db_connection.query(
			'INSERT INTO Solution_Student (solution_file_id, assigned_challenge_id, completion_date) VALUES ((SELECT solution_file_id FROM Solution_File WHERE solution_blob = ?), ?, NOW());',
			[data_to_db, parseInt(req.body.assigned_challenge_id)],
			function (err, rows) {
				if (err) {
					console.log(err);
					req.flash('error', ' An error occured');
					res.locals.message = req.flash();
					return res.render('student_challenges/view_set_challenges', {
						title: 'View Set Challenges',
						menu_id: 'view_set_challenges',
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
		return res.redirect('/view_set_challenges');

	} catch (any_error) {
		res.locals.message = req.flash();
		return res.render('student_challenges/view_set_challenges', {
			title: 'View Set Challenges',
			menu_id: 'view_set_challenges',
			role: req.user.role,
			email: req.user.email,
			session_id: req.sessionID,
			session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
		});
	}

});


module.exports = router;

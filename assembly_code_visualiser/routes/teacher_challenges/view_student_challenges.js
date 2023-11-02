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


// coming to view_student_challenges page
router.get('/', auth.check_authenticated, async function (req, res, next) {

	res.locals.message = req.flash();

	try {

		await get_challenges_assigned_not_assigned(req, res, next, true).then((rows) => {

			var all_assigned_challenges = [];

			rows.forEach(element => {
				all_assigned_challenges.push([element['challenge_blob'].toString(), element['challenge_teacher_id']]);
			});

			console.log('all_assigned_challenges');
			console.log(all_assigned_challenges);

			return {
				'all_assigned_challenges': all_assigned_challenges
			};

		}).then(async (useful_vars) => {

			await get_challenges_assigned_not_assigned(req, res, next, false).then((rows) => {

				var all_not_assigned_challenges = [];

				rows.forEach(element => {
					all_not_assigned_challenges.push([element['challenge_blob'].toString(), element['challenge_teacher_id']]);
				});

				console.log('all_not_assigned_challenges');
				console.log(all_not_assigned_challenges);

				useful_vars['all_not_assigned_challenges'] = all_not_assigned_challenges;

			});

			return useful_vars;

		}).then((useful_vars) => {

			useful_vars['all_assigned_challenges'].forEach(async (element, index) => {

				var route_more_info = '/more_information/' + element[1];

				router.post(route_more_info, async function (req, res, next) {

					res.locals.message = req.flash();

					try {

						await get_students_assigned_challenge_teacher_and_solved(req, res, next, parseInt(element[1])).then((rows) => {

							var students_solved = [];

							rows.forEach(element_new => {
								students_solved.push([element_new['CONCAT(Student.student_name, Student.student_number)'].toString(), element_new['student_id'], moment(element_new['due_date']).utc(utc_datetime).local().format(), moment(element_new['completion_date']).utc(utc_datetime).local().format()]);
							});

							console.log('students_solved');
							console.log(students_solved);

							return {
								'students_solved': students_solved
							};

						}).then(async (useful_vars) => {

							await get_students_assigned_challenge_teacher_and_not_solved(req, res, next, parseInt(element[1])).then((rows) => {

								var students_not_solved_before_due = []; // can still solve
								var students_not_solved_after_due = []; // has not completed assignment and cannot complete it now

								rows.forEach(element_new => {

									// past deadline
									if (new Date() >= new Date(moment(element_new['due_date']).utc(utc_datetime).local().format())) {
										students_not_solved_before_due.push([element_new['CONCAT(Student.student_name, Student.student_number)'].toString(), element_new['student_id'], moment(element_new['due_date']).utc(utc_datetime).local().format()]);
									} else {
										students_not_solved_after_due.push([element_new['CONCAT(Student.student_name, Student.student_number)'].toString(), element_new['student_id'], moment(element_new['due_date']).utc(utc_datetime).local().format()]);
									};

								});

								console.log('students_not_solved_before_due');
								console.log(students_not_solved_before_due);
								console.log('students_not_solved_after_due');
								console.log(students_not_solved_after_due);

								useful_vars['students_not_solved_before_due'] = students_not_solved_before_due;
								useful_vars['students_not_solved_after_due'] = students_not_solved_after_due;

							});

							return useful_vars;

						}).then(async (useful_vars) => {

							useful_vars['students_solved'].forEach(async (element_latest, index_latest) => {

								var route_view_solution = route_more_info + '/view_answer/' + element_latest[1];

								router.post(route_view_solution, async function (req, res, next) {

									res.locals.message = req.flash();

									await get_answer_blob(req, res, next, parseInt(element[1]), parseInt(element_latest[1])).then((rows) => {

										rows.forEach(first_row => {
											answer_blob = first_row['solution_blob'];
										});

										return res.render('teacher_challenges/view_answer', {
											title: 'View Completed Challenge',
											role: req.user.role,
											email: req.user.email,
											session_id: req.sessionID,
											session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
											challenge_title: element[0].split('\n')[1].toString(),
											challenge_description: element[0].split('\n')[3].toString(),
											challenge_answer: answer_blob.toString()
										});

									});

								});
							
							});

							return res.render('teacher_challenges/more_information', {
								title: 'More Information',
								role: req.user.role,
								email: req.user.email,
								session_id: req.sessionID,
								session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
								challenge_title: element[0].split('\n')[1].toString(),
								challenge_description: element[0].split('\n')[3].toString(),
								challenge_teacher_id: element[1].toString(),
								students_solved: useful_vars['students_solved'],
								students_not_solved_before_due: useful_vars['students_not_solved_before_due'],
								students_not_solved_after_due: useful_vars['students_not_solved_after_due']
							});

						});
						
					} catch (any_error) {

						res.render('teacher_challenges/more_information', {
							title: 'More Information',
							role: req.user.role,
							email: req.user.email,
							session_id: req.sessionID,
							session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
							challenge_title: element[0].split('\n')[1].toString(),
							challenge_description: element[0].split('\n')[3].toString(),
							challenge_teacher_id: element[1].toString()
						});	
						
					}

				});

			});

			return res.render('teacher_challenges/view_student_challenges', {
				title: 'View Student Challenges',
				menu_id: 'view_student_challenges',
				role: req.user.role,
				email: req.user.email,
				all_assigned_challenges: useful_vars['all_assigned_challenges'],
				all_not_assigned_challenges: useful_vars['all_not_assigned_challenges'],
				session_id: req.sessionID,
				session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
			});

		});
		
	} catch (any_error) {
		console.log(any_error);
		res.render('teacher_challenges/view_student_challenges', {
			title: 'View Student Challenges',
			menu_id: 'view_student_challenges',
			role: req.user.role,
			email: req.user.email,
			session_id: req.sessionID,
			session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
		});
	}

});

var get_challenges_assigned_not_assigned = (req, res, next, assigned) => {
	return new Promise((resolve, reject) => {
		try {

			if (assigned) {
				// all challenge_teacher_id's that have been assigned to some student
				var query_to_run = 'SELECT * FROM Challenge_Teacher, Challenge_File WHERE Challenge_Teacher.challenge_file_id = Challenge_File.challenge_file_id AND Challenge_Teacher.challenge_teacher_id IN(SELECT challenge_teacher_id FROM Assigned_Challenges) AND Challenge_Teacher.teacher_id = ?;';
			} else {
				// all challenge_teacher_id's that have not been assigned to some student
				var query_to_run = 'SELECT * FROM Challenge_Teacher, Challenge_File WHERE Challenge_Teacher.challenge_file_id = Challenge_File.challenge_file_id AND Challenge_Teacher.challenge_teacher_id NOT IN (SELECT challenge_teacher_id FROM Assigned_Challenges) AND Challenge_Teacher.teacher_id = ?;';
			};

			db_connection.query(
				query_to_run,
				[req.user.id],
				function (err, rows) {

					if (err) {
						console.log(err);
						req.flash('error', ' An error occured');
						res.locals.message = req.flash();
						return res.render('teacher_challenges/view_student_challenges', {
							title: 'View Student Challenges',
							menu_id: 'view_student_challenges',
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

var get_students_assigned_challenge_teacher_and_solved = (req, res, next, challenge_teacher_id) => {
	return new Promise((resolve, reject) => {
		try {

			// get all students who have been assigned challenge_teacher_id and solved
			db_connection.query(
				'SELECT CONCAT(Student.student_name, Student.student_number), Student.student_id, Assigned_Challenges.due_date, Solution_Student.completion_date FROM Solution_Student, Solution_File, Student, Assigned_Challenges WHERE Solution_Student.solution_file_id = Solution_File.solution_file_id AND Assigned_Challenges.assigned_challenge_id = Solution_Student.assigned_challenge_id AND Assigned_Challenges.student_id = Student.student_id AND Assigned_Challenges.challenge_teacher_id = ? AND Assigned_Challenges.assigned_challenge_id IN (SELECT assigned_challenge_id FROM Solution_Student);',
				[challenge_teacher_id],
				function (err, rows) {

					if (err) {
						console.log(err);
						req.flash('error', ' An error occured');
						res.locals.message = req.flash();
						return res.render('teacher_challenges/view_student_challenges', {
							title: 'View Student Challenges',
							menu_id: 'view_student_challenges',
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
var get_students_assigned_challenge_teacher_and_not_solved = (req, res, next, challenge_teacher_id) => {
	return new Promise((resolve, reject) => {
		try {

			// get all students who have been assigned challenge_teacher_id and solved
			db_connection.query(
				'SELECT CONCAT(Student.student_name, Student.student_number), Student.student_id, Assigned_Challenges.due_date FROM Student, Assigned_Challenges WHERE Assigned_Challenges.student_id = Student.student_id AND Assigned_Challenges.challenge_teacher_id = ? AND Assigned_Challenges.assigned_challenge_id NOT IN (SELECT assigned_challenge_id FROM Solution_Student);',
				[challenge_teacher_id],
				function (err, rows) {

					if (err) {
						console.log(err);
						req.flash('error', ' An error occured');
						res.locals.message = req.flash();
						return res.render('teacher_challenges/view_student_challenges', {
							title: 'View Student Challenges',
							menu_id: 'view_student_challenges',
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

var get_answer_blob = (req, res, next, challenge_teacher_id, student_id) => {
	return new Promise((resolve, reject) => {
		try {

			// get all students who have been assigned challenge_teacher_id and solved
			db_connection.query(
				'SELECT * FROM Solution_File, Solution_Student WHERE Solution_File.solution_file_id = Solution_Student.solution_file_id AND Solution_Student.assigned_challenge_id = (SELECT assigned_challenge_id FROM Assigned_Challenges WHERE challenge_teacher_id = ? AND student_id = ?);',
				[challenge_teacher_id, student_id],
				function (err, rows) {

					if (err) {
						console.log(err);
						req.flash('error', ' An error occured');
						res.locals.message = req.flash();
						return res.render('teacher_challenges/view_student_challenges', {
							title: 'View Student Challenges',
							menu_id: 'view_student_challenges',
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


module.exports = router;

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
router.get('/', auth.check_authenticated, function (req, res, next) {

	try {

		res.locals.message = req.flash();

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
				}

				// console.log(rows);

				var challenges_to_display = [];
				var challenges_only = [];

				rows.forEach(element => {
					challenges_to_display.push([element['challenge_blob'].toString(), element['challenge_file_id'], moment(element['due_date']).utc(utc_datetime).local().format()]);
					challenges_only.push(element['challenge_blob'].toString());
				});

				console.log(challenges_to_display);

				// console.log(challenges_to_display);
				// console.log(challenges_only);

				// console.log('challenges_to_display start');
				// console.log(challenges_to_display);
				// console.log('challenges_to_display end');

				// var challenge_title_match_id = [];

				// challenges_to_display.forEach(element => {

				// 	// separate challenge titles and descriptions
				// 	// challenge_titles.push(element.split('\n')[1]);
				// 	// challenge_descriptions.push(element.split('\n')[3]);

				// 	// console.log('in forEach loop');

				// 	// populate list of [challenge_title, challenge_file_id]
				// 	challenge_title_match_id.push([element[0].split('\n')[1], element[1]]);
				// });

				// console.log(challenge_title_match_id);

				// console.log(challenge_titles);
				// console.log(challenge_descriptions);

				// challenges_to_display.forEach((element_new, index) => {

				// 	// console.log('inside here start');
				// 	// console.log(element_new, index);

				// 	var route_delete = '/delete/' + index.toString();

				// 	router.post(route_delete, function (req, res, next) {

				// 		// console.log('hi start');
				// 		// console.log(element_new);
				// 		// console.log('hi end');

				// 		// ! NOTE: THIS WORKS, EXCEPT WHEN THERE IS 1 REMAINING

				// 		db_connection.query(
				// 			'DELETE FROM Challenge_File WHERE challenge_file_id = ?;',
				// 			[element_new[1]],
				// 			function (err, rows) {
				// 				if (err) {
				// 					console.log(err);
				// 					req.flash('error', ' An error occured');
				// 					res.locals.message = req.flash();
				// 					return res.redirect('/create_challenges');
				// 				}
				// 				// console.log(rows);
				// 			}
				// 		);

				// 		return res.redirect('/create_challenges');
				// 	});

				return res.render('student_challenges/view_set_challenges', {
					title: 'View Set Challenges',
					menu_id: 'view_set_challenges',
					role: req.user.role,
					email: req.user.email,
					challenges_to_display: challenges_to_display,
					challenges_only: challenges_only,
					session_id: req.sessionID,
					session_expiry_time: new Date(req.session.cookie.expires) - new Date(),
				});

			}
		);
		
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


module.exports = router;

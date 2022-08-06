var db_connection = require('../lib/db');
var bcrypt = require('bcrypt');

var create_new_user = (data) => {
	return new Promise(async (resolve, reject) => {

		// check if email exists or not
		var email_exists = await check_exist_email(data.email);

		if (email_exists) {
			reject(`This email "${data.email}" already exists, please choose another email`);
		} else {

			// hash password
			var salt = bcrypt.genSaltSync(10);
			var user_item = {
				email: data.email,
				name: data.name,
				number: data.number,
				password: bcrypt.hashSync(data.password, salt),
				year_group: data.year_group,
				class_code: data.class_code
			};

			// create a new account
			db_connection.query(
				'INSERT INTO Student (student_email, student_name, student_number, student_password) VALUES (?, ?, ?, ?); INSERT INTO Students_In_Classes (student_id, class_id) VALUES ((SELECT student_id FROM Student WHERE student_email = ?), (SELECT class_id FROM Class WHERE year_group = ? AND teacher_id = (SELECT teacher_id FROM Teacher WHERE class_code = ?)));', 
				[user_item.email, user_item.name, user_item.number, user_item.password, user_item.email, user_item.year_group, user_item.class_code],
				function(err, rows) {
					if (err) {
						reject(false)
					}
					resolve('Created a new user');
				}
			);
		}

	});
};

var check_exist_email = (email) => {
	return new Promise((resolve, reject) => {
		try {
			db_connection.query(
				'SELECT * FROM `Student` WHERE `student_email` = ?;', email,
				function(err, rows) {
					if (err) {
						reject(err)
					}
					if (rows.length > 0) {
						resolve(true)
					} else {
						resolve(false)
					}
				}
			);
		} catch (error) {
			reject(error);
		}
	});
};

module.exports = {
	create_new_user: create_new_user
}

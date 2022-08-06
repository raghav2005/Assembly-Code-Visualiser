var db_connection = require('../lib/db');
var bcrypt = require('bcrypt');

var handle_login = (email, password) => {
	return new Promise(async (resolve, reject) => {

		// check if email exists or not
		var user = await find_user_by_email(email);

		if (user) {
			// compare passwords
			await bcrypt.compare(password, user.password).then((isMatch) => {
				if (isMatch) {
					resolve(true);
				} else {
					reject(`The password you entered is incorrect`);
				}
			});
		} else {
			reject(`This user email "${email}" does not exist`);
		}
	});
};

var find_user_by_email = (email) => {
	return new Promise((resolve, reject) => {
		try {
			db_connection.query(
				'SELECT * FROM `Student` WHERE `student_email` = ?;', email,
				function(err, rows) {
					if (err) {
						reject(err)
					}
					var user = rows[0];
					resolve(user);
				}
			);
		} catch (error) {
			reject(error);
		}
	})
}

var find_user_by_id = (id) => {
	return new Promise((resolve, reject) => {
		try {
			db_connection.query(
				'SELECT * FROM `Student` WHERE `student_id` = ?;', id,
				function(err, rows) {
					if (err) {
						reject(err)
					}
					var user = rows[0];
					resolve(user);
				}
			);
		} catch (error) {
			reject(error);
		}
	});
};

var compare_password = (password, user_object) => {
	return new Promise(async (resolve, reject) => {
		try {
			await bcrypt.compare(password, user_object.password).then((isMatch) => {
				if (isMatch) {
					resolve(true);
				} else {
					resolve(`The password entered is incorrect`);
				}
			});
		} catch (error) {
			reject(error);
		}
	});
};

module.exports = {
	handle_login: handle_login,
	find_user_by_email: find_user_by_email,
	find_user_by_id: find_user_by_id,
	compare_password: compare_password
};

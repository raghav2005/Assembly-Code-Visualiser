var express = require('express');
var router = express.Router();
var db_connection = require('../lib/db');

// display students page
router.get('/', function (req, res, next) {

	db_connection.query('SELECT * FROM students ORDER BY id desc', function (err, rows) {

		if (err) {
			req.flash('error', err);
			// render to views/students/index.ejs
			res.render('students', { page: 'Students', menu_id: 'students', data: '' });
		} else {
			// render to views/students/index.ejs
			res.render('students', { page: 'Students', menu_id: 'students', data: rows });
		}
	});
});

// display add students page
router.get('/add', function (req, res, next) {
	// render to add.ejs
	res.render('students/add', {
		page: 'Add Students',
		menu_id: 'add_students',
		name: '',
		age: '',
		sex: ''
	})
})

// add a new student
router.post('/add', function (req, res, next) {

	let name = req.body.name;
	let age = req.body.age;
	let sex = req.body.sex;
	let errors = false;

	if (name.length === 0 || age.length === 0 || sex.length === 0) {
		errors = true;

		// set flash message
		req.flash('error', "Please enter name, age, and sex");
		// render to add.ejs with flash message
		res.render('students/add', {
			page: 'Add Students',
			menu_id: 'add_students',
			name: name,
			age: age,
			sex: sex
		})
	}

	// if no error
	if (!errors) {

		var form_data = {
			name: name,
			age: age,
			sex: sex
		}

		// insert query
		db_connection.query('INSERT INTO students SET ?', form_data, function (err, result) {
			//if(err) throw err
			if (err) {
				req.flash('error', err)

				// render to add.ejs
				res.render('students/add', {
					page: 'Add Students',
					menu_id: 'add_students',
					name: form_data.name,
					age: form_data.age,
					sex: form_data.sex
				})
			} else {
				req.flash('success', 'Student successfully added');
				res.redirect('/students');
			}
		})
	}
})

module.exports = router;

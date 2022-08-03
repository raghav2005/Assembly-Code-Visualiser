var express = require('express');
var router = express.Router();
var db_connection = require('../lib/db');

// display students page
router.get('/', function(req, res, next) {

	var form_data = {
		name: 'Raghav',
		age: 17,
		sex: 'M'
	}

	db_connection.query('INSERT INTO students SET ?', form_data, function(err, result) {
		if (err) {
			req.flash('error', err);
		} else {
			req.flash('success', 'values successfully added');
			res.redirect('/');
		}
	})

	res.send('added to table');
});

module.exports = router;

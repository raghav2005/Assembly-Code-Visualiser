var mysql = require('mysql');

require('dotenv').config()

var DB_HOST = process.env.DB_HOST
var DB_USER = process.env.DB_USER
var DB_PASSWORD = process.env.DB_PASSWORD
var DB_DATABASE = process.env.DB_DATABASE
var DB_PORT = process.env.DB_PORT

var connection = mysql.createConnection({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_DATABASE,
	port: DB_PORT
})

connection.connect(function (error) {
	if (!!error) {
		console.log('Could not establish a connection with the database:' + error);
	} else {
		console.log('Connected to Database..!');
	}
});

module.exports = connection;

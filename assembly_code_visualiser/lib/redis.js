// redis for cookie and session management
var { createClient } = require('redis');

require('dotenv').config()

// from .env
var REDIS_HOST = process.env.REDIS_HOST
var REDIS_PORT = process.env.REDIS_PORT
var REDIS_DATABASE = process.env.REDIS_DATABASE

// redis configuration
var redisClient = createClient({
	legacyMode: true,
	host: REDIS_HOST,
	port: REDIS_PORT,
	database: REDIS_DATABASE
});

redisClient.connect().catch(console.error);

redisClient.on('error', function (err) {
	console.log('Could not establish a connection with redis:' + err);
});
redisClient.on('connect', function (err) {
	console.log('Connected to Redis..!');
});


module.exports = redisClient;

var mysql = require('mysql');
var config = require('../config');

var pool = mysql.createPool({
	host: config.databaseHost,
	user: config.databaseUsername,
	password: config.databasePassword,
	database: 'oxie'
});

exports.pool = pool;

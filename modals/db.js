var mysql = require('mysql');

module.exports = function(host,user,password) {
	return mysql.createPool({
		host: host,
		user: user,
		password: password,
		database: 'oxie'
	});
}

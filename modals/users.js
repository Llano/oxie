module.exports = function(host, user, password){
	var db = require('./db')(host, user, password);

	var authenticate = function(email, password, callback) {
		var sql = "SELECT * FROM users WHERE email = ? AND password = ?";
		db.getConnection(function(err, connection) {
			if(err) { console.log(err); callback(true); return; }
			connection.query(sql, [email, password], function(err, result) {
				connection.release();
				callback(result);
			})
		});
	}

	return {authenticate: authenticate};
}

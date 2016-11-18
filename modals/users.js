var db = require('../modals/db').pool;

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

var updatePoints = function(points, userid) {
	var sql = 'UPDATE users SET points = points + ? WHERE id = ?';
	db.getConnection(function(err, connection) {
		if(err) { console.log(err); callback(true); return; }
		connection.query(sql, [points, userid] ,function(err, result) {
			connection.release();
		})
	});
}


module.exports = {
	authenticate: authenticate,
	updatePoints: updatePoints
}

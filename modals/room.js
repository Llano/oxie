var db = require('../modals/db').pool;


var getRoom = function(roomid, callback) {
	var sql = "SELECT * FROM rooms WHERE url = ?";
	db.getConnection(function(err, connection) {
		if(err) { console.log(err); callback(true); return; }
		connection.query(sql, [roomid], function(err, result) {

			connection.release();
			callback(result);
		})
	});
}

var getRooms = function(callback) {
	var sql = "SELECT * FROM rooms";
	db.getConnection(function(err, connection) {
		if(err) { console.log(err); callback(true); return; }
		connection.query(sql, function(err, result) {

			connection.release();
			callback(result);
		})
	});
}


module.exports = {
	getRoom: getRoom,
	getRooms: getRooms
}

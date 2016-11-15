var db = require('./db');

var getRoom = function(roomid, callback) {
    var sql = "SELECT * FROM rooms WHERE url = ?";
    db.pool.getConnection(function(err, connection) {
        if(err) { console.log(err); callback(true); return; }
        connection.query(sql, [roomid], function(err, result) {

            connection.release();
            callback(result);
        })
    });

}

var getRooms = function(callback) {
    var sql = "SELECT * FROM rooms";
    db.pool.getConnection(function(err, connection) {
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

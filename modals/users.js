var db = require('./db');

var authenticate = function(email, password, callback) {
    var sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.pool.getConnection(function(err, connection) {
        if(err) { console.log(err); callback(true); return; }
        connection.query(sql, [email, password], function(err, result) {

            connection.release();
            callback(result);
        })
    });
}

module.exports = {
    authenticate: authenticate
}

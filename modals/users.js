var db = require('./db')("localhost","root","pw");

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

module.exports = {
    authenticate: authenticate
}

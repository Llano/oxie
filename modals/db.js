var mysql = require('mysql');

var pool = mysql.createPool({
  /*host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB*/

  host: '192.168.1.9',
  user: 'pingu',
  password: '$=RqN5xg',
  database: 'oxie'
});

exports.pool = pool;

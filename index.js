var app         = require('express')();
var express = require('express');
var http          = require('http').Server(app);
var io              = require('socket.io')(http);
var MongoClient     = require('mongodb').MongoClient;
var path            = require('path')
MongoClient.connect("mongodb://localhost:27017/oxie", function(err, db) {
  if(!err) {
    console.log("Connected to database: " + db.databaseName);
  }
});
var quizIO = io.of('/quiz');
quizIO.on('connection', function(socket){
    socket.on('room', function(room) {
        socket.join('room');
        console.log("Client joined room " + room);
    })
});
app.use(express.static(path.join(__dirname, 'public')));
app.get("/" ,function(req, res) {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get("/room/:id" ,function(req, res) {
    res.sendFile(path.join(__dirname, 'public/html/room.html'));
});
http.listen(3000, function() {
    console.log("Running on port 3000..");
});

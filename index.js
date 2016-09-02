var app         = require('express')();
var express = require('express');
var http          = require('http').Server(app);
var io              = require('socket.io')(http);
var path            = require('path');
var roomModel = require("./modals/room");

var quizIO = io.of('/quiz');
quizIO.on('connection', function(socket){
    socket.on('room', function(room) {
        if(socket.room)
            socket.leave(socket.room);

        socket.room = room;
        socket.join(room);
        socket.emit("user:message", "You joined a room. Welcome..!");
        socket.broadcast.to(room).emit("user:message", socket.id + " joined");

        socket.on('user:message', function(msg) {
            socket.broadcast.to(room).emit('user:message', msg);
            console.log(msg);
        });


    });




});
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get("/" ,function(req, res) {
    res.render('pages/index');
});

app.param("roomid", function(req, res, next, roomid) {
    roomModel.getRoom(roomid, function(room) {
        if(room != null) {
            req.room = room;
            next();
        }
        else {
            res.render('pages/404');
        }
    })
});
app.get("/room/:roomid" ,function(req, res) {
    res.render('pages/room', {room: req.room[0]});
});
http.listen(3000, function() {
    console.log("Running on port 3000..");
});

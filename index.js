var app         = require('express')();
var express = require('express');
var http          = require('http').Server(app);
var io              = require('socket.io')(http);
var path            = require('path');
var roomModel = require("./modals/room");
var auth = require("./helpers/auth");
var bodyParser = require('body-parser');
var userModel = require('./modals/users');
var cookieSession = require('cookie-session');
var bot = require('./bot.js');



var bots = {};
var nsp = {};
roomModel.getRooms(function(rooms) {
    for (var i = 0; i < rooms.length; i++) {
        //bots[rooms[i].url] = new bot.Bot(rooms[i].url);
        nsp[rooms[i].url] = new bot.Bot(io.of(rooms[i].url));

    }
})




var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that
    // with toString() and then trim()
    var cmd = d.toString().trim();
    if(cmd == "cs") {
        for(var room in nsp) {
            console.log("----" + room + "----");
            for(var user in nsp[room].people) {
                console.log(nsp[room].people[user]);
            }
        }
    }
  });

app.use(cookieSession({
  name: 'session',
  keys: ['herpderp'],

  // Cookie Options
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
}));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.get("/" ,function(req, res) {
    res.render('pages/index');
});

app.get("/rooms", function(req, res) {
    roomModel.getRooms(function(rooms) {
        var r = {};
        for (var i = 0; i < rooms.length; i++) {
            r[rooms[i].url] = {'id': rooms[i].id, 'title': rooms[i].title, people: [nsp[rooms[i].url].people]}
        }
        res.render('pages/rooms', {rooms: r});
    })

})
app.param("roomid", function(req, res, next, roomid) {
    roomModel.getRoom(roomid, function(room) {
        if(room.length > 0) {
            req.room = room;
            next();
        }
        else {
            res.render('pages/404');
        }
    })
});
app.get("/room/:roomid", function(req, res) {
    res.render('pages/room', {room: req.room[0]});
});

app.get("/login", function(req, res) {
    res.render("pages/login");
});

app.get("/logout", function(req, res) {
    req.session = null;
    res.redirect("/");
});
app.post("/login", function(req, res) {
    userModel.authenticate(req.body.email, req.body.password, function(result) {
        if(result.length > 0) {
            req.session.user_id = result[0].id;
            res.redirect("/");
        }
        else {
            res.render("pages/login", {status: 'Wrong email or password'});
        }
    })
});
http.listen(3000, function() {
    console.log("Running on port 3000..");
});

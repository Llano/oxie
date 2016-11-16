var app          = require('express')();
var express      = require('express');
var http         = require('http').Server(app);
var io           = require('socket.io')(http);
var path         = require('path');
var db           = require('./modals/db')(process.argv.length>2 ? process.argv[2] : "localhost",
                                            process.argv.length>3 ? process.argv[3] : "root",
											process.argv.length>4 ? process.argv[4] : "");
var roomModel    = require("./modals/room")(db);
var userModel    = require('./modals/users')(db);
var auth         = require("./helpers/auth");
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser')();
var session      = require('cookie-session')({secret: 'secret', maxAge: 30 * 24 * 60 * 60 * 1000});
var bot          = require('./bot.js');
var auth         = require('./helpers/auth.js');

var port        = process.argv.length>5 ? process.argv[5] : 3000;

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
        console.log("USERS ONLINE");
        for(var room in nsp) {
            console.log("----" + room + "----");
            for(var user in nsp[room].people) {
                console.log(nsp[room].people[user]);
            }
        }
    }
    process.stdout.write("oxie%: ");
  });

app.use(cookieParser);
app.use(session);
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

io.use(function(socket, next) {
    var req = socket.handshake;
    var res = {};
    cookieParser(req, res, function(err) {
        if (err) return next(err);
        session(req, res, next);
    });
});

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
app.get("/room/:roomid", auth.requireLoggedin, function(req, res) {
    res.render('pages/room', {room: req.room[0], username: req.session.username});
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
            req.session.username = result[0].username;
            res.redirect("/");
        }
        else {
            res.render("pages/login", {status: 'Wrong email or password'});
        }
    })
});

http.listen(port, function() {
    console.log("Running on port "+port+"...");
    process.stdout.write("oxie%: ");
});

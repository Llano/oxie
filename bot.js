var request = require('request');
var striptags = require('striptags');
var userModel = require('./modals/users');
var Bot = function(nsp) {
    this.people = {};
    var that = this;
    that.socket = null;
    this.nsp = nsp;
    this.interval = null;
    this.timeOutOne = null;
    this.timeOutTwo = null;
    this.running = false;
    this.currentQuestion = null;
    this.userColor = '#084C61';
    this.name = 'System';
    this.adminColor = '#DB3A34';
    nsp.on('connection', function(s){
        that.socket = s;
        s.on('user:joined', function(data) {that.joined(data, s)});
        s.on('disconnecting', function() {that.leave(s)});
        s.on('user:message', function(data) {that.message(data, s)});

    });


}


Bot.prototype.message = function(data, socket) {
    var message = this.formatMessage(socket, data)
    this.nsp.emit('user:message', message);
    if(message.message.toLowerCase() == (this.currentQuestion.results[0].correct_answer).toLowerCase()) {
        this.onCorrectAnswer(message.message, socket);
    }
}
Bot.prototype.leave = function(socket) {
    if(Object.keys(this.people).length < 1) {
        this.onEmtpyRoom();
    }
    socket.broadcast.emit("user:left", {username: this.people[socket.id].username, id: socket.id});
    userModel.updatePoints(this.people[socket.id].points, socket.handshake.session.user_id);
    if(socket.id in this.people) {
        delete this.people[socket.id];
    }

}

Bot.prototype.joined = function(data, socket) {

    this.systemMessageClient(socket, "You joined a room. Welcome..!");
    this.people[socket.id] = {username: data.username, points: 0};
    socket.broadcast.emit("user:joined", {username: this.people[socket.id].username, id: socket.id, points: this.people[socket.id].points});
    socket.emit("user:list", {people: this.people});
    if(Object.keys(this.people).length > 0) {
        this.onPopulatedRoom();
    }

}

Bot.prototype.formatMessage = function(socket, message) {

    var fm = null;
    switch (socket.handshake.session.role) {

        //Normal user
        case 0:
            fm = {username: this.people[socket.id].username, message: striptags(message)}
            break;

        //Admin
        case 1:
            fm = {username: "<span style='color:"+ this.adminColor +"'>" + this.people[socket.id].username + "</span>", message: message}

            break;

    }

    return fm;
}

Bot.prototype.onEmtpyRoom = function() {
    if(this.running ==true) {
        //Stop the damn BOT
        this.clearTimers();
    }
    this.running = false;
}

Bot.prototype.onPopulatedRoom = function() {
    if(this.running == false)
    {
        this.sendQuestion();
    }
    this.running = true;


}

Bot.prototype.clearTimers = function() {
    clearInterval(this.interval);
    clearTimeout(this.timeOutOne);
    clearTimeout(this.timeOutTwo);
}
Bot.prototype.onCorrectAnswer = function(data, socket) {
    this.systemMessageNsp(this.people[socket.id].username + " answered correctly with: " + data);
    this.people[socket.id].points = this.people[socket.id].points + 1;
    this.nsp.emit("user:point", {username: this.people[socket.id].username, id: socket.id, points: this.people[socket.id].points});

    this.clearTimers();
    this.sendQuestion();
}
Bot.prototype.onNoCorrectAnswer = function() {
    this.systemMessageNsp("Correct answer: " + this.currentQuestion.results[0].correct_answer);
    this.clearTimers();
    this.sendQuestion();

}

Bot.prototype.systemMessageClient = function(socket, message) {
    socket.emit("user:message", {username: "<span style='color:"+ this.userColor +"'>" + this.name + "</span>", message: message});
}
Bot.prototype.systemMessageNsp = function(message) {
    this.nsp.emit("user:message", {username: "<span style='color:"+ this.userColor +"'>" + this.name + "</span>", message: message});
}

Bot.prototype.fetchQuestion = function(callback) {
    var that = this;
    request('https://www.opentdb.com/api.php?amount=1&difficulty=easy&type=multiple', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var json = JSON.parse(body);
            that.currentQuestion = json;
            callback();
        }
    })
}
Bot.prototype.sendQuestion = function() {
    var that = this;
    this.fetchQuestion(function() {


        that.systemMessageNsp("New question in 5 seconds..");


        setTimeout(function() {

            that.systemMessageNsp(that.currentQuestion.results[0].question);
            that.interval = setInterval(function() {
                that.systemMessageNsp("Hint 1: " + (that.currentQuestion.results[0].correct_answer).replace(/[^' ']/g, '_ ').replace(/ /g, "\xa0\xa0"));
                clearInterval(that.interval);
                that.timeOutOne = setTimeout(function() {
                    that.systemMessageNsp("Hint 2: " + that.makeHint(that.currentQuestion.results[0].correct_answer));

                    that.timeOutTwo = setTimeout(function() {
                        that.onNoCorrectAnswer();
                    }, 7000);
                }, 7000);

            }, 10000)







        }, 6000);

    });





}

Bot.prototype.makeHint = function(str) {
    var s = str.split("");
    for (var i = 0; i < s.length; i++) {
        if(!/[^0-9a-zA-Z]/.test(s[i]))
        {
            if(i % 2 == 0)
            {
                s[i] = ' _ '
            }
        }
        else {
            if(/\s/.test(s[i]))
            {
                s[i] = '&nbsp &nbsp';
            }
        }
    }
    return s.join("");
}


module.exports = {
    Bot: Bot
}

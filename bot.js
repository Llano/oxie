var clientSocket = require('socket.io/node_modules/socket.io-client');
var request = require('request');
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
    nsp.on('connection', function(s){
        that.socket = s;
        s.on('user:joined', function(data) {that.joined(data, s)});
        s.on('disconnecting', function() {that.leave(s)});
        s.on('user:message', function(data) {that.message(data, s)});

    });


}


Bot.prototype.message = function(data, socket) {
    socket.broadcast.emit('user:message', {username: this.people[socket.id].username, message: data});
    if(data.toLowerCase() == (this.currentQuestion.results[0].correct_answer).toLowerCase()) {
        this.onCorrectAnswer(data, socket);
    }
}
Bot.prototype.leave = function(socket) {
    if(Object.keys(this.people).length < 1) {
        this.onEmtpyRoom();
    }
    socket.broadcast.emit("user:left", {username: this.people[socket.id].username, id: socket.id});
    delete this.people[socket.id]; //TODO use splice
}

Bot.prototype.joined = function(data, socket) {

    socket.emit("user:message", {username: "System", message: "You joined a room. Welcome..!"});
    this.people[socket.id] = {username: data.username, points: 0};
    socket.broadcast.emit("user:joined", {username: this.people[socket.id].username, id: socket.id, points: this.people[socket.id].points});
    socket.emit("user:list", {people: this.people});
    if(Object.keys(this.people).length > 0) {
        this.onPopulatedRoom();
    }

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
    this.nsp.emit("user:message", {username: "System", message: this.people[socket.id].username + " answered correctly with: " + data});
    this.people[socket.id].points = this.people[socket.id].points + 1;
    this.nsp.emit("user:point", {username: this.people[socket.id].username, id: socket.id, points: this.people[socket.id].points});

    this.clearTimers();
    this.sendQuestion();
}
Bot.prototype.onNoCorrectAnswer = function() {
    this.nsp.emit("user:message", {username: "System", message: "Correct answer: " + this.currentQuestion.results[0].correct_answer});
    this.sendQuestion();

}

Bot.prototype.fetchQuestion = function(callback) {
    var that = this;
    request('https://opentdb.com/api.php?amount=1', function (error, response, body) {
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


        that.nsp.emit("user:message", {username: "System", message: "New question in 5 seconds.."});


        setTimeout(function() {

            that.nsp.emit("user:message", {username: "System", message: that.currentQuestion.results[0].question});
            that.interval = setInterval(function() {
                that.nsp.emit("user:message", {username: "System", message: "Hint 1: " + (that.currentQuestion.results[0].correct_answer).replace(/./g, '_ ')});
                clearInterval(that.interval);
                that.timeOutOne = setTimeout(function() {
                    that.nsp.emit("user:message", {username: "System", message: "Hint 2: " + that.makeHint(that.currentQuestion.results[0].correct_answer)});

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
    for (var i = 0; i < s.length; i+=2) {
        s[i] = ' _ '
    }

    return s.join("");
}


module.exports = {
    Bot: Bot
}

var clientSocket = require('socket.io-client');
var Bot = function(nsp) {
    this.people = {};
    var that = this;
    that.socket = null;
    nsp.on('connection', function(s){
        that.socket = s;
        s.on('user:joined', function(data) {that.joined(data, s)});
        s.on('disconnect', function(data) {that.leave(data, s)});
        s.on('user:message', function(data) {that.message(data, s)});

    });

}


Bot.prototype.message = function(data, socket) {
    socket.broadcast.emit('user:message', {username: this.people[socket.id], message: data});
}
Bot.prototype.leave = function(data, socket) {
    socket.broadcast.emit("user:left", {username: this.people[socket.id], id: socket.id});
    delete this.people[socket.id]; //TODO use splice
}

Bot.prototype.joined = function(data, socket) {
    socket.emit("user:message", {username: "System", message: "You joined a room. Welcome..!"});
    this.people[socket.id] = data.username;
    socket.broadcast.emit("user:joined", {username: this.people[socket.id], id: socket.id});
    socket.emit("user:list", {people: this.people});
}
Bot.prototype.sendQuestion = function() {

}

module.exports = {
    Bot: Bot
}

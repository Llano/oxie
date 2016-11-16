window.MainWindow = React.createClass({
    getInitialState: function() {
        return {socket: null, messages: [], username: null, users:[]};
    },
    componentDidMount: function() {
        //var socket = io('/quiz');

        var socket = io('/' + this.props.room.url);
        var that = this;
        socket.on('connect', function() {
            that.onConnect(socket);
        });
        socket.on("user:message", this.userMessage);
        socket.on("user:joined", this.userJoined);
        socket.on("user:left", this.userLeft);
        socket.on("user:list", this.userList);
    },
    onConnect: function(s) {
        this.setState({socket: s, username: this.props.username});
        //s.emit('room', {room: this.props.room.url, username: this.state.username});
        s.emit('user:joined', {username: this.state.username});
    },
    userMessage: function(data) {
        console.log(data);
        var {messages} = this.state;
        messages.push(data);
        this.setState({messages});
        var elem = document.getElementById('message-content');
        elem.scrollTop = elem.scrollHeight;
    },
    userList: function(data) {
        this.setState({users: data.people});
    },
    userJoined: function(data) {
        var users = this.state.users;
        users[data.id] = [data.username, null];
        this.setState({users: users});
    },
    userLeft: function(data) {
        var users = this.state.users;
        delete users[data.id];
        this.setState({users: users});

    },
    handleMessageSubmit: function (message) {
        var {messages} = this.state;
        messages.push({username: this.state.username, message: message});
        this.setState({messages});
        this.state.socket.emit('user:message', message);
        var elem = document.getElementById('message-content');
        elem.scrollTop = elem.scrollHeight;

    },
    componentDidUpdate: function() {
        var elem = document.getElementById('message-content');
        elem.scrollTop = elem.scrollHeight;
    },
    render: function() {

        return (
            <div>
                <div id="top">
                    <MessageList messages={this.state.messages}/>
                    <UserList users={this.state.users}/>
                </div>
                <MessageForm onMessageSubmit={this.handleMessageSubmit}/>

            </div>
        )
    }
});

var MessageList = React.createClass({
    render: function() {
        return (
            <div id="message-content">
                {
                    this.props.messages.map((message, i) => {
                        return (
                              <div key={i}>{message.username + ": " + message.message}</div>
                          );
                      })
                  }


            </div>
        )
    }
});

var MessageForm = React.createClass({

  getInitialState() {
      return {text: ''};
  },

  handleSubmit(e) {
      e.preventDefault();
      var message = this.state.text;
      this.props.onMessageSubmit(message);
      this.setState({ text: '' });
  },

  changeHandler(e) {
      this.setState({ text : e.target.value });
  },

  render() {
      return(
          <div className='message_form'>
              <form onSubmit={this.handleSubmit}>
                  <input
                      onChange={this.changeHandler}
                      value={this.state.text}
                  />
              </form>
          </div>
      );
  }
});

var UserList = React.createClass({
    getInitialState: function() {
        return {};
    },
    render() {
        var users = this.props.users;
        return (
            <div id="user_list">
                <h3>Users</h3>
                <ul>
                {
                    Object.keys(users).map(function(key) {
                        return <li key={key}>{users[key]}</li>;
                    })
                }


                </ul>
            </div>
        )
    }
})

window.MainWindow = React.createClass({
    getInitialState: function() {
        return {socket: null, messages: []};
    },
    componentDidMount: function() {
        var socket = io('/quiz');
        var that = this;
        socket.on('connect', function() {
            that.onConnect(socket);
        });
        socket.on("user:message", this.userMessage);
    },
    onConnect: function(s) {
        this.setState({socket: s});
        s.emit('room', this.props.room.url);
    },
    userMessage: function(message) {
        var {messages} = this.state;
        messages.push(message);
        this.setState({messages});
    },
    handleMessageSubmit: function (message) {
        var {messages} = this.state;
        messages.push(message);
        this.setState({messages});
        this.state.socket.emit('user:message', message);
    },
    render: function() {
        return (
            <div>
                <header><h1>{this.props.room.title}</h1></header>
                <MessageList messages={this.state.messages}/>
                <MessageForm
                onMessageSubmit={this.handleMessageSubmit}
                />
            </div>
        )
    }
});

var MessageList = React.createClass({
    render: function() {
        return (
            <div>
                {
                    this.props.messages.map((message, i) => {
                        return (
                              <div key={i}>{message}</div>
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
              <h3>Write New Message</h3>
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

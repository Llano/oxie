window.MainWindow = React.createClass({
    getInitialState: function() {
        return {socket: null, rooms: {}};
    },
    componentDidMount: function() {


    },
    componentWillMount: function() {

        console.log(this.props.rooms);
        /*var room = {};
        for (var i = 0; i < this.props.rooms.length; i++) {
            room[this.props.rooms[i].url] = [[]];
        }*/

        this.setState({rooms: this.props.rooms});
    },
    /*onConnect: function(s) {
        var that = this;
        this.setState({socket: s});
        for (var i = 0; i < this.props.rooms.length; i++) {
            s.emit('roominfo', {roomid: this.props.rooms[i].url});
        }

        s.on("roominfo", function(data) {
            var rooms = that.state.rooms;
            for(var key in data.people) {
                var room = rooms[data.people[key][1]];

                room[0].push(data.people[key]);
            }

            rooms[data.people[key][1]] = room;
            that.setState({rooms: rooms, done: true});


        })



    },*/
    render: function() {
        var re = null;
        return (
            <RoomList rooms={this.state.rooms} />
        )
    }
});

var RoomList = React.createClass({

    render: function() {
        var rooms = this.props.rooms;
        return (

            <div>
                    <ul className="collection">
                    {
                        Object.keys(rooms).map(function(key) {

                            return <li className="collection-item avatar" key={rooms[key].id}><img src="http://placehold.it/50x50" className="circle" /><span className="title"><a href={"/room/" + rooms[key].url}>{rooms[key].title}</a></span><p>{"Online: " + Object.values(rooms[key].people[0]).length}</p></li>
                        })


                    }

                    </ul>

            </div>

        );
    }

});

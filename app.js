var Ticker = React.createClass({
  getInitialState: function() {
    return {};
  },
  tick: function() {
    var left = this.state.secondsLeft - 1;
    if( left != parseInt(left) || 0 >= left ){
        this.stopTicking();
        return;
    }
    this.setState({secondsLeft: left});
  },
  startTicking: function( t ){
     this.setState({secondsLeft: t});
    this.interval = setInterval(this.tick, 1000);
  },
  stopTicking: function(){
    clearInterval(this.interval);
    this.setState({secondsLeft: 'NOW'});
  },
  render: function() {
    return (
      <div>Updated list available in: {this.state.secondsLeft}</div>
    );
  }
});
var theTicker = React.render( <Ticker />, document.getElementById('ticker') );
 
 
var Housing = React.createClass({
    getInitialState: function() {
        return { title : _bootstrap.meta.name, groups : _bootstrap.groups, rooms : _bootstrap.rooms, roomCount : _bootstrap.roomCount, isDataPending: false, dataPending: null, dataPendingDownloadedAt: false };
    },
    componentDidMount:function(){
        document.getElementById('loader').className = '';
        this.updateDataEvery30();
    },
    titleChange: function( e ){
        this.setState({ title : e.target.value });
    },
    applyPendingData: function(){
        if( !this.state.isDataPending ){
            return;
        }
        var d = this.state.dataPending;
        this.setState({ groups : d.groups, rooms : d.rooms, roomCount : d.roomCount, isDataPending: false, dataPending: null, dataPendingDownloadedAt: false });
    },
    updateDataEvery30: function(){
        var that = this,
            t = 15;
        if( theTicker.isMounted() ){
            theTicker.startTicking( t );
        }
        setTimeout(function(){
            that.updateData( t );
        }, t * 1000);
    },
    updateData: function(t){
        var that = this;
        document.getElementById('loader').className = 'active';
        if( theTicker.isMounted() ){
            theTicker.stopTicking();
        }
        $.getJSON('http://awbauer.cms-devl.bu.edu/nonwp/test3.json.php', function(r){
            var now = new Date();
            if( r.hasOwnProperty('groups') && r.hasOwnProperty('rooms') ){
                that.setState({ isDataPending: true, dataPending: r, dataPendingDownloadedAt: now.toISOString() })
            }
            document.getElementById('loader').className = '';
            if( t > 0 ){
                if( theTicker.isMounted() ){
                    theTicker.startTicking( t );
                }
                setTimeout(function(){
                    that.updateData( t );
                }, (t*1000));
            }
        }.bind(this));
    },
    render: function(){
        var applyDataDisplay = this.state.isDataPending ? '' : 'none';
            lastDownloadAgo = ( this.state.dataPendingDownloadedAt ) ? moment( this.state.dataPendingDownloadedAt ).fromNow() : ''; 
        return (
            <div>
                <p className="apply-data" style={{display:applyDataDisplay}} onClick={this.applyPendingData}>Update data <br /><span className="downloaded-time">Downloaded {lastDownloadAgo}</span></p>
                <RoomList groups={this.state.groups} rooms={this.state.rooms} roomCount={this.state.roomCount} />
            </div>
        );
    }
});
 
var RoomList = React.createClass({
    render: function() {
        return (
        <div>
            <div className='loaded-rooms-count'>Loaded {this.props.groups.length} groups containing {this.props.roomCount} rooms</div>
            <br /><br />
            {this.props.groups.map(function(s,i,a) {
              return <RoomGroup group={s} rooms={this.props.rooms[s.id]} key={s.id} />;
            },this)}
        </div>
        );
    }
}); 

var RoomGroup = React.createClass({
   getInitialState: function() {
        return { expanded: false };
    },
    toggleShow: function(){
        this.setState({ expanded: !this.state.expanded });
    },
    render: function() {
        return (
            <div className="bu_collapsible_container" style={{ overflow : 'hidden' }}>
                <h2 className="bu_collapsible" onClick={this.toggleShow} style={{ cursor: 'pointer' }}>{this.props.group.name} <span className="group-room-summary">({this.props.group.availableRoomCount} rooms available)</span></h2>
                <GroupTable rooms={this.props.rooms} expanded={this.state.expanded} />
            </div>
        );
    }
});

var GroupTable = React.createClass({
    render: function(){
        if( !this.props.expanded ){
            return <div />;
        }
        return(
            <div className="bu_collapsible_section">
                <table style={{listStyleType:'none'}}>
                    <thead>
                        <th>Room ID</th>
                        <th>Room Description</th>
                        <th>More things</th>
                    </thead>
                    <tbody>
                        {this.props.rooms.map(function(s,i) {
                          return <Row data={s} key={i} />;
                        })}
                    </tbody>
                </table>
            </div>
            );
    }
});
 
var Row = React.createClass({
    shouldComponentUpdate: function(nextProps, nextState){
        return nextProps.data.wasRecentlyTaken !== this.props.data.wasRecentlyTaken;
    },
    render: function(){
        var recentlyTakenClass = this.props.data.wasRecentlyTaken ? ' booked ' : '';
        return (
            <tr className={recentlyTakenClass}>
                <td>{this.props.data.key+1}</td>
                <td>{this.props.data.name}</td>
                <td>{this.props.data.details}</td>
            </tr>
        );
    }
});
React.render( <Housing />, document.getElementById('housing_table') );
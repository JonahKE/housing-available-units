var DisplayMixin = {
    maybePlural: function( qty, singularLabel, pluralLabel ){
        if( 'undefined' === typeof pluralLabel ){
            pluralLabel = singularLabel + 's';
        }
        return qty + ' ' + ( qty == 1 ? singularLabel : pluralLabel );
    }
};
var Ticker = React.createClass({
  getInitialState: function() {
    return {};
  },
  tick: function() {
    var left = this.state.secondsLeft - 1;
    
    this.updateMoment();
    
    if( left != parseInt(left) || 0 >= left ){
        this.stopTicking();
        return;
    }
    this.setState({secondsLeft: left}); 
  },
  updateMoment: function(){
    var timeSince = document.querySelector('.last-updated .time');

    if( undefined === timeSince.dataset.timestamp ){
        return;
    }

    newText = moment( timeSince.dataset.timestamp ).fromNow();

    if( newText == timeSince.innerHTML ){
        return;
    }

    timeSince.innerHTML = newText;   
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
      <div>Updates in: {this.state.secondsLeft}</div>
    );
  }
});
var theTicker = React.render( <Ticker />, document.getElementById('ticker') );
 
 
var Housing = React.createClass({
    getInitialState: function() {
        return { 
            title : _bootstrap.metaData.name, 
            areas : _bootstrap.areas, 
            units : _bootstrap.units, 
            roomCount : _bootstrap.totalRoomCount, 
            isDataPending: false, 
            dataPending: null, 
            lastDownloadTime: new Date() 
        };
    },
    componentDidMount:function(){
        document.getElementById('loader').className = '';
        this.updateDataEvery90();
    },
    titleChange: function( e ){
        this.setState({ title : e.target.value });
    },
    applyPendingData: function(){
        if( !this.state.isDataPending ){
            return;
        }
        var d = this.state.dataPending;
        this.setState({ areas : d.areas, units : d.units, roomCount : d.totalRoomCount, isDataPending: false, dataPending: null, lastDownloadTime: false });
    },
    updateDataEvery90: function(){
        var that = this,
            t = 90;
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
        $.getJSON('http://awbauer.cms-devl.bu.edu/non-wp/housing/units.json.php', function(r){
            var now = new Date();
            if( r.hasOwnProperty('areas') && r.hasOwnProperty('units') ){
                // that.setState({ isDataPending: true, dataPending: r, lastDownloadTime: now.toISOString() })
                that.setState({ areas: r.areas, units: r.units, lastDownloadTime: new Date() });
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
        var applyDataDisplay = this.state.isDataPending ? '' : 'none',
            that = this;
        return (
            <div>
                <span className="last-updated">Last updated <span className="time" data-timestamp={this.state.lastDownloadTime.toISOString()}>{moment(this.state.lastDownloadTime.toISOString()).fromNow()}</span></span>
                <RoomList areas={this.state.areas} units={this.state.units} roomCount={this.state.roomCount} />
            </div>
        );
    }
});
 
var RoomList = React.createClass({
    mixins: [DisplayMixin],
    render: function() {
        var areasText = this.maybePlural( this.props.areas.length, 'area' ), 
            unitsText = this.maybePlural( this.props.roomCount, 'unit' );
        return (
            <div>
                <div className='loaded-units-count'>Loaded {areasText} containing {unitsText}</div>
                <br /><br />
                {this.props.areas.map(function(s,i,a) {
                  return <RoomGroup group={s} units={s.units} key={s.id} />;
                },this)}
            </div>
        );
    }
}); 

var RoomGroup = React.createClass({
    mixins: [DisplayMixin],
    getInitialState: function() {
        return { expanded: false };
    },
    toggleShow: function(){
        this.setState({ expanded: !this.state.expanded });
    },
    render: function() {
        var g           = this.props.group,
            aptText     = this.maybePlural( g.spacesAvailableByType.Apartment, 'apartment' ),
            suiteText   = this.maybePlural( g.spacesAvailableByType.Suite, 'suite' ),
            dormText    = this.maybePlural( g.spacesAvailableByType.Dormitory, 'dorm' ),
            bedsText    = this.maybePlural( this.props.group.availableSpaceCount, 'bed' );

        return (
            <div className="bu_collapsible_container" style={{ overflow : 'hidden' }}>
                <h2 className="bu_collapsible" onClick={this.toggleShow} style={{ cursor: 'pointer' }}>
                    <span className="glyphicon glyphicon-chevron-right" aria-hidden="true"></span> &nbsp;
                    {this.props.group.name} &nbsp;
                    <span className="group-room-summary">{bedsText} available: &nbsp;
                        {aptText} | &nbsp;
                        {suiteText} | &nbsp;
                        {dormText}
                        </span>
                </h2>
                <GroupTable units={this.props.units} expanded={this.state.expanded} />
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
                        {this.props.units.map(function(s,i) {
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
        return (nextProps.data.wasRecentlyTaken !== this.props.data.wasRecentlyTaken);
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
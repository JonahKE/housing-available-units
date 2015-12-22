var updateInterval = 10;
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
        this.doUpdateData();
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
    doUpdateData: function(){
        var that = this;
        if( theTicker.isMounted() ){
            theTicker.startTicking( updateInterval );
        }
        setTimeout(function(){
            that.updateData( updateInterval );
        }, updateInterval * 1000);
    },
    updateData: function(t){
        var that = this;
        document.getElementById('loader').className = 'active';
        if( theTicker.isMounted() ){
            theTicker.stopTicking();
        }
        $.getJSON('http://awbauer.cms-devl.bu.edu/non-wp/housing/units.json.php', function(r){
            var now = new Date();
            if( r.hasOwnProperty('areas') ){
                // that.setState({ isDataPending: true, dataPending: r, lastDownloadTime: now.toISOString() })
                that.setState({ areas: r.areas, lastDownloadTime: new Date() });
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
                <AreaTable units={this.props.units} expanded={this.state.expanded} />
            </div>
        );
    }
});

var AreaTable = React.createClass({
    render: function(){
        if( !this.props.expanded ){
            return <div />;
        }
        return(
            <div className="bu_collapsible_section">
                <table style={{listStyleType:'none'}}>
                    <thead>
                        <th>Location</th>
                        <th>Floor</th>
                        <th>Unit #</th>
                        // <th>Room Type</th>
                        // <th>Room #</th>
                        <th># Spaces Available</th>
                        <th>Gender</th>
                        <th>Specialty</th>
                    </thead>
                    <tbody>
                        {this.props.units.map(function(s,i) {
                          return <UnitRow data={s} key={i} />;
                        })}
                    </tbody>
                </table>
            </div>
            );
    }
});

// @todo - distinguish between unit/room data
 
var UnitRow = React.createClass({
    shouldComponentUpdate: function(nextProps, nextState){
        return (nextProps.data.unitAvailableSpaces !== this.props.data.unitAvailableSpaces);
    },
    render: function(){
        // console.log(this.props);
        var recentlyTakenClass = ( this.props.data.unitAvailableSpaces > 0 ) ? '' : ' booked ';
        return (
            <tr className={recentlyTakenClass}>
                <td>{this.props.data.location}</td>
                <td>{this.props.data.floor}</td>
                <td>{this.props.data.id}</td>
                // <td>{this.props.data.roomType}</td> // Room data
                // <td>{this.props.data.room}</td> // Room data
                <td>{this.props.data.unitAvailableSpaces} of {this.props.data.unitTotalSpaces}</td>
                <td>{this.props.data.gender}</td>
                <td>{this.props.data.specialty}</td>
            </tr>
        );
    }
});
React.render( <Housing />, document.getElementById('housing_table') );
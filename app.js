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
    return {
        secondsLeft : updateInterval
    };
  },
  tick: function() {
    if( !this.isMounted() ){
        return;
    }
    var left = this.state.secondsLeft - 1;
    
    // this.updateMoment();
    
    if( left != parseInt(left) || 0 >= left ){
        this.stopTicking();
        return;
    }
    this.setState({secondsLeft: left}); 
  },
  updateMoment: function(){
    var timeSince = document.querySelector('.last-updated .time'),
        newText;

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
    if( !this.isMounted() ){
        return;
    }
    
    if( t !== updateInterval ){
        this.setState({secondsLeft: t});
    }

    this.interval = setInterval( this.tick, 1000 );
  },
  stopTicking: function(){
    clearInterval(this.interval);
    if( !this.isMounted() ){
        return;
    }
    this.setState({secondsLeft: 'NOW'});
  },
  render: function() {
    return (
      <div>Updates in: {this.state.secondsLeft}</div>
    );
  }
});
//var theTicker = React.render( <Ticker />, document.getElementById('ticker') );
 
var FilterBar = React.createClass({ 
    render: function(){
        var f = this.props.filters;

        return (
                <div className="filter-container">
                    <h2>Filter by...</h2>
                    <div className="filter-group">
                        <h3>Gender</h3>
                        <label><input type="checkbox" checked={f.genders.Female} name="genders" value="Female" onChange={this.props.updateFilters} /> Female</label> <br />
                        <label><input type="checkbox" checked={f.genders.Male} name="genders" value="Male" onChange={this.props.updateFilters} /> Male</label> <br />
                        <label><input type="checkbox" checked={f.genders['Gender Neutral']} name="genders" value="Gender Neutral" onChange={this.props.updateFilters} /> Gender Neutral</label>
                    </div>
                    <div className="filter-group">
                        <h3>Room Size <br /> <span style={{fontSize:'0.5em',fontStyle:'italic'}}>Not 100% accurate (due to limitations of sample data)</span></h3>
                        <label><input type="checkbox" checked={f.roomMaxOcc['1']} name="roomMaxOcc" value="1" onChange={this.props.updateFilters} /> Single</label> <br />
                        <label><input type="checkbox" checked={f.roomMaxOcc['2']} name="roomMaxOcc" value="2" onChange={this.props.updateFilters} /> Double</label> <br />
                        <label><input type="checkbox" checked={f.roomMaxOcc['3']} name="roomMaxOcc" value="3" onChange={this.props.updateFilters} /> Triple</label> <br />
                        <label><input type="checkbox" checked={f.roomMaxOcc['4']} name="roomMaxOcc" value="4" onChange={this.props.updateFilters} /> Quad</label>
                    </div>
                    <div className="filter-group">
                        <h3>Unit Type</h3>
                        <label><input type="checkbox" checked={f.roomTypes['Apartment']} name="roomTypes" value="Apartment" onChange={this.props.updateFilters} /> Apartment</label><br />
                        <label><input type="checkbox" checked={f.roomTypes['Suite']} name="roomTypes" value="Suite" onChange={this.props.updateFilters} /> Suite</label><br />
                        <label><input type="checkbox" checked={f.roomTypes['Dormitory']} name="roomTypes" value="Dormitory" onChange={this.props.updateFilters} /> Dormitory</label>
                    </div>
                    <div className="filter-group">
                        <h3>Specialty Housing <br /> <span style={{fontSize:'0.5em',fontStyle:'italic'}}>Work in progress</span></h3>
                    </div>
                </div>
            );
    }
});

var Housing = React.createClass({
    mixins: [DisplayMixin],
    getInitialState: function() {
        return { 
            title               : _bootstrap.metaData.name, 
            areas               : _bootstrap.areas, 
            units               : _bootstrap.units, 
            roomCount           : _bootstrap.totalRoomCount, 
            isDataPending       : false, 
            dataPending         : null, 
            lastDownloadTime    : new Date(),
            filtersActive       : false,
            filters : {
                'roomMaxOcc' : {
                    '1' : true,
                    '2' : true,
                    '3' : true,
                    '4' : true
                },
                'specialty' : {
                    'Chinese House'     : true, 
                    'Special House One' : true
                },
                'roomTypes' : {
                    'Apartment' : true, 
                    'Suite'     : true, 
                    'Dormitory' : true
                },
                'genders' : {
                    'Male'              : true,
                    'Female'            : true,
                    'Gender Neutral'    : true
                }
            }
        };
    },
    componentDidMount:function(){
        document.getElementById('loader').className = '';
        setTimeout( this.updateData, updateInterval * 1000);
    },
    updateData: function(t){
        document.getElementById('loader').className = 'active';

        $.getJSON('http://awbauer.cms-devl.bu.edu/non-wp/housing/units.json.php', function(r){
            var now = new Date();
            if ( r.hasOwnProperty( 'areas' ) ){
                // this.setState({ isDataPending: true, dataPending: r, lastDownloadTime: now.toISOString() })
                this.setState({ areas: r.areas, lastDownloadTime: new Date() });
            }
            document.getElementById( 'loader' ).className = '';
            setTimeout( this.updateData, updateInterval * 1000 );
        }.bind(this));
    },
    updateFilters: function( e ) {
        var filterGroup = e.target.name,
            filterProp = e.target.value,
            filterValue = e.target.checked;

        switch ( e.target.type ){
            case 'checkbox':
                this.setState( previousState => {
                    var initial = this.getInitialState();

                    previousState.filters[filterGroup][filterProp] = filterValue;
                    previousState.filtersActive = ( JSON.stringify( previousState.filters ) !== JSON.stringify( initial.filters ) );
                });
        }
    },
    renderAreas: function(s,i,a) {
        return <Area group={s} units={s.units} key={s.id} filters={this.state.filters} filtersActive={this.state.filtersActive} />;
    },
    render: function(){
        var applyDataDisplay = this.state.isDataPending ? '' : 'none',
            timestampISO = this.state.lastDownloadTime.toISOString(),
            friendlyTimestamp = moment( timestampISO ).fromNow(), 
            areasText = this.maybePlural( this.state.areas.length, 'area' ), 
            bedsText = this.maybePlural( this.state.roomCount, 'bed' );
        return (
            <div>
                <span className="last-updated">Last updated <span className="time" data-timestamp={timestampISO}>{friendlyTimestamp}</span></span>
                <div className='loaded-units-count'>Loaded {areasText} containing {bedsText}</div>
                <FilterBar filters={this.state.filters} updateFilters={this.updateFilters} />
                { this.state.areas.map( this.renderAreas, this ) }
            </div>
        );
    }
});

var Area = React.createClass({
    mixins: [DisplayMixin],
    getInitialState: function() {
        return { 
            expanded: false
        };
    },
    toggleShow: function(){
        this.setState({ expanded: !this.state.expanded });
    },
    render: function() {
        var g           = this.props.group,
            aptText     = this.maybePlural( g.spacesAvailableByType.Apartment, 'apartment' ),
            suiteText   = this.maybePlural( g.spacesAvailableByType.Suite, 'suite' ),
            dormText    = this.maybePlural( g.spacesAvailableByType.Dormitory, 'dorm' ),
            bedsText    = this.maybePlural( this.props.group.availableSpaceCount, 'bed' ),
            arrow_icon  = 'glyphicon ' + ( this.state.expanded ? 'glyphicon-chevron-down' : 'glyphicon-chevron-right' ),
            roomSummaryDisplay = ( this.props.filtersActive ) ? 'none' : 'initial',
            filtersActiveDisplay = ( this.props.filtersActive ) ? 'initial' : 'none';

        return (
            <div className="bu_collapsible_container" style={{ overflow : 'hidden' }}>
                <h2 className="bu_collapsible" onClick={this.toggleShow} style={{ cursor: 'pointer' }}>
                    <span className={arrow_icon} aria-hidden="true"></span> &nbsp;
                    {this.props.group.name} &nbsp;
                    <span className="group-room-summary" style={{ display: roomSummaryDisplay }}>{bedsText} available: &nbsp;
                        {aptText} | &nbsp;
                        {suiteText} | &nbsp;
                        {dormText}
                    </span>
                    <span className="filters-active"  style={{ display: filtersActiveDisplay }}>Filter(s) active</span>
                </h2>
                <AreaTable units={this.props.units} expanded={this.state.expanded} filters={this.props.filters} />
            </div>
        );
    }
});

var AreaTable = React.createClass({
    isRoomVisible: function(unit,room){
        // console.log(this.props.filters);
        return ( 
                this.props.filters.roomTypes[ room.summaryRoomType ] &&
                this.props.filters.roomMaxOcc[ room.roomTotalSpaces ] &&
                this.props.filters.specialty[ unit.specialty ] &&
                this.props.filters.genders[ unit.gender ]
            );
    },
    render: function(){
        var rooms = [];

        if( !this.props.expanded ){
            return <div />;
        }
        
        this.props.units.map( function( u, i ) {
            var maybeTakenClass = ( u.unitAvailableSpaces > 0 ) ? '' : ' booked ';
            u.rooms.map( function( r, j ){
                if( this.isRoomVisible( u, r ) ){
                    rooms.push( <Room data={r} unit={u} key={r.id} recentlyTakenClass={maybeTakenClass} /> );
                }
            }, this);
        }, this);

        return (
            <div className="bu_collapsible_section">
                <table style={{listStyleType:'none'}}>
                    <thead>
                        <th>Location</th>
                        <th>Floor</th>
                        <th>Unit #</th>
                        <th>Room Type</th>
                        <th>Room #</th>
                        <th># Spaces Available</th>
                        <th>Gender</th>
                        <th>Specialty</th>
                    </thead>
                    <tbody>
                        {rooms}
                    </tbody>
                </table>
            </div>
        );
    }
});
 
var Room = React.createClass({
    shouldComponentUpdate: function( nextProps, nextState ){
        return ( nextProps.unit.unitAvailableSpaces !== this.props.unit.unitAvailableSpaces );
    },
    render: function(){
        return (
            <tr className={this.props.recentlyTakenClass}>
                <td>{this.props.unit.location}</td>
                <td>{this.props.unit.floor}</td>
                <td>{this.props.unit.id}</td>
                <td>{this.props.data.roomType}</td>
                <td>{this.props.data.room}</td>
                <td>{this.props.unit.unitAvailableSpaces} of {this.props.unit.unitTotalSpaces}</td>
                <td>{this.props.unit.gender}</td>
                <td>{this.props.unit.specialty}</td>
            </tr>
        );
    }
});
React.render( <Housing />, document.getElementById('housing_table') );
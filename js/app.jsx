jQuery.ajaxSetup({ cache: false });

var updateInterval = 30;
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
                        <label><input type="checkbox" checked={f.genders['CoEd']} name="genders" value="CoEd" onChange={this.props.updateFilters} /> Gender Neutral</label>
                    </div>
                    <div className="filter-group">
                        <h3>Room Size</h3>
                        <label><input type="checkbox" checked={f.roomMaxOcc['1']} name="roomMaxOcc" value="1" onChange={this.props.updateFilters} /> Single</label> <br />
                        <label><input type="checkbox" checked={f.roomMaxOcc['2']} name="roomMaxOcc" value="2" onChange={this.props.updateFilters} /> Double</label> <br />
                        <label><input type="checkbox" checked={f.roomMaxOcc['3']} name="roomMaxOcc" value="3" onChange={this.props.updateFilters} /> Triple</label> <br />
                        <label><input type="checkbox" checked={f.roomMaxOcc['4']} name="roomMaxOcc" value="4" onChange={this.props.updateFilters} /> Quad</label>
                    </div>
                    <div className="filter-group">
                        <h3>Unit Type</h3>
                        <label><input type="checkbox" checked={f.roomTypes['Apt']} name="roomTypes" value="Apt" onChange={this.props.updateFilters} /> Apt</label><br />
                        <label><input type="checkbox" checked={f.roomTypes['Suite']} name="roomTypes" value="Suite" onChange={this.props.updateFilters} /> Suite</label><br />
                        <label><input type="checkbox" checked={f.roomTypes['Studio']} name="roomTypes" value="Studio" onChange={this.props.updateFilters} /> Studio</label><br />
                        <label><input type="checkbox" checked={f.roomTypes['Dorm']} name="roomTypes" value="Dorm" onChange={this.props.updateFilters} /> Dorm</label>
                    </div>
                    <div className="filter-group">
                        <h3>Specialty Housing</h3>
                    </div>
                </div>
            );
    }
});

var Housing = React.createClass({
    mixins: [DisplayMixin],
    getInitialState: function() {
        return { 
            // title               : hau_opts._bootstrap.metaData.name, 
            areas               : hau_opts._bootstrap.areas, 
            units               : hau_opts._bootstrap.units, 
            roomCount           : hau_opts._bootstrap.totalRoomCount, 
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
                    ''                  : true, 
                    'Chinese House'     : true, 
                    'Special House One' : true
                },
                'roomTypes' : {
                    'Apt'       : true, 
                    'Suite'     : true, 
                    'Studio'    : true, 
                    'Dorm'      : true
                },
                'genders' : {
                    'Male'      : true,
                    'Female'    : true,
                    'CoEd'      : true
                }
            }
        };
    },
    componentDidMount:function(){
        document.getElementById('loader').className = '';
        setTimeout( this.updateData, updateInterval * 1000);
    },
    updateData: function(){
        document.getElementById('loader').className = 'active';

        jQuery.getJSON( ajaxurl, { action : 'housing_availability' }, function(r){
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
        return <Area group={s} units={s.units} key={s.areaID} name={s.areaID} filters={this.state.filters} filtersActive={this.state.filtersActive} />;
    },
    render: function(){
        var applyDataDisplay = this.state.isDataPending ? '' : 'none',
            timestampISO = this.state.lastDownloadTime.toISOString(),
            friendlyTimestamp = moment( timestampISO ).fromNow(), 
            areasText = this.maybePlural( this.state.areas.length, 'area' ), 
            unitsText = this.maybePlural( this.state.roomCount, 'unit' );
        return (
            <div>
                <span className="last-updated">Last updated <span className="time" data-timestamp={timestampISO}>{friendlyTimestamp}</span></span>
                <div className='loaded-units-count'>Loaded {areasText} containing {unitsText}</div>
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
            aptText     = this.maybePlural( g.spacesAvailableByType.Apt, 'Apt' ),
            suiteText   = this.maybePlural( g.spacesAvailableByType.Suite, 'suite' ),
            dormText    = this.maybePlural( g.spacesAvailableByType.Dorm, 'dorm' ),
            unitsText    = this.maybePlural( this.props.group.availableSpaceCount, 'unit' ),
            arrow_icon  = 'glyphicon ' + ( this.state.expanded ? 'glyphicon-chevron-down' : 'glyphicon-chevron-right' ),
            roomSummaryDisplay = ( this.props.filtersActive ) ? 'none' : 'initial',
            filtersActiveDisplay = ( this.props.filtersActive ) ? 'initial' : 'none';

        return (
            <div className="bu_collapsible_container" style={{ overflow : 'hidden' }}>
                <h2 className="bu_collapsible" onClick={this.toggleShow} style={{ cursor: 'pointer' }}>
                    <span className={arrow_icon} aria-hidden="true"></span> &nbsp;
                    {this.props.name} &nbsp;
                    <span className="group-room-summary" style={{ display: roomSummaryDisplay }}>{unitsText} available: &nbsp;
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
    showPopover: function(e){
        // console.log(e);
        // jQuery(e).popover('show');
    },
    isRoomVisible: function(unit,room){
        // console.log( 'FILTERS: ' + JSON.stringify(this.props.filters));
        // console.log( 'ROOM: ' + JSON.stringify(room));
        return ( 
                this.props.filters.roomTypes[ room.summaryRoomType ] &&
                this.props.filters.roomMaxOcc[ room.roomTotalSpaces ] &&
                this.props.filters.specialty[ unit.specialty ] &&
                this.props.filters.genders[ unit.gender ]
            );
    },
    render: function(){
        var rooms = [],
            locationsPopover;

        if( !this.props.expanded ){
            // console.log(locationsPopover);
            return <div />;
        }
        
        this.props.units.map( function( u, i ) {
            var maybeTakenClass = ( u.unitAvailableSpaces > 0 ) ? '' : ' booked ';
            u.rooms.map( function( r, j ){
                // console.log( 'ROOM: ' + JSON.stringify(r));
                if( this.isRoomVisible( u, r ) ){
                    rooms.push( <Room data={r} unit={u} key={r.roomID} recentlyTakenClass={maybeTakenClass} /> );
                } else{
                    // console.log(false);
                }
            }, this);
        }, this);

        return (
            <div className="bu_collapsible_section">
                <table style={{listStyleType:'none'}}>
                    <thead>
                        <th><a href="#" onClick={this.showPopover} data-container="body" ref={function(e) {
                              if (e != null) {
                                jQuery(e).popover();
                              }
                            }}>
                            <span className="glyphicon glyphicon-filter" aria-label="Click to Filter Locations"></span></a> Location</th>
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
    getInitialState: function() {
        return { 
            hidden          : ( ! this.props.unit.unitAvailableSpaces ),
            recentlyTaken   : false
        };
    },
    shouldComponentUpdate: function( nextProps, nextState ){
        return ( nextProps.unit.unitAvailableSpaces !== this.props.unit.unitAvailableSpaces );
    },
    componentWillReceiveProps: function(nextProps){
        if( this.props.unit.unitAvailableSpaces > 0 && !nextProps.unit.unitAvailableSpaces ){
            this.setState({
                hidden : false,
                recentlyTaken: true
            });
        }
    },
    render: function(){
        var recentlyTakenClass = this.state.recentlyTaken ? ' booked ' : '';
        
        if( this.state.hidden ){
            return <tr />;
        }

        return (
            <tr className={recentlyTakenClass}>
                <td>{this.props.unit.location}</td>
                <td>{this.props.unit.floor}</td>
                <td>{this.props.unit.unitID}</td>
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
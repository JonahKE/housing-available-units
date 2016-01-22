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
 
 var FilterCheckbox = React.createClass({ 
    render: function(){
        return (
            <label><input type="checkbox" checked={this.props.isChecked} name={this.props.category} value={this.props.name} onChange={this.props.updateFilters} /> {this.props.name}</label>
            );
    }
});

var FilterBar = React.createClass({ 
    getInitialState: function() {
        return { 
            visible : false, 
        };
    },
    toggleVisible: function(){
        this.setState( previousState => {
            previousState.visible = !previousState.visible;
        });
    },
    render: function(){
        var f = this.props.filters,
            maybeVisible = ( this.state.visible ) ? 'block' : 'none',
            icon = (this.state.visible) ? 'glyphicon glyphicon-minus' : 'glyphicon glyphicon-plus';

        return (
                <div className="filter-container bu_collapsible_container" style={{ overflow : 'hidden' }} style={{ cursor: 'pointer' }}>
                    <h2 className="bu_collapsible" onClick={this.toggleVisible}><span className={icon} aria-label="Click to Filter Rooms"></span> Filter Rooms...</h2>
                    <div className="bu_collapsible_section" style={{display : maybeVisible}}>
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
                </div>
            );
    }
});

var BuildingsLine = React.createClass({ 
    render: function(){
        return (
                <div><label><input type="checkbox" name={this.props.building} checked={this.props.checked} onChange={this.props.updateFilter} /> {this.props.building}</label><br /></div>
            );
    }
});

var CurrentAsOf = React.createClass({ 
    render: function(){
        return (
                <div><span className="last-updated">Last updated <span className="time" data-timestamp={this.props.lastUpdated}>{this.props.lastUpdated}</span></span></div>
            );
    }
});

var Housing = React.createClass({
    mixins: [DisplayMixin],
    getInitialState: function() {
        return { 
            // title               : hau_opts._bootstrap.metaData.name, 
            areas               : _bootstrap.areas, 
            units               : _bootstrap.units, 
            roomCount           : _bootstrap.totalRoomCount, 
            isDataPending       : false, 
            dataPending         : null, 
            dataCreateTimestamp : _bootstrap.createTime,
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

        jQuery.getJSON( hau_opts.units_json, function(r){
            var now = new Date();
            if ( r.hasOwnProperty( 'areas' ) ){
                // this.setState({ isDataPending: true, dataPending: r, lastDownloadTime: now.toISOString() })
                this.setState({ areas: r.areas, lastDownloadTime: new Date(), dataCreateTimestamp: r.createTime });
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
        return (
            <div>
                <CurrentAsOf lastUpdated={this.state.dataCreateTimestamp} />
                <FilterBar filters={this.state.filters} updateFilters={this.updateFilters} />
                { this.state.areas.map( this.renderAreas, this ) }
            </div>
        );
    }
});

var Area = React.createClass({
    mixins: [DisplayMixin],
    getInitialState: function() {
        var buildingsList = new Object();

        this.props.group.buildings.map( function( b ){
            buildingsList[ b ] = true;
        }, this );

        return { 
            expanded: false,
            buildingsFilter: buildingsList
        };
    },
    toggleShow: function(){
        this.setState({ expanded: !this.state.expanded });
    },
    render: function() {
        // console.log(this.state.buildingsFilter);
        var g                       = this.props.group,
            aptText                 = this.maybePlural( g.spacesAvailableByType.Apt, 'Apt' ),
            suiteText               = this.maybePlural( g.spacesAvailableByType.Suite, 'suite' ),
            dormText                = this.maybePlural( g.spacesAvailableByType.Dorm, 'dorm' ),
            unitsText               = this.maybePlural( this.props.group.availableSpaceCount, 'unit' ),
            arrow_icon              = 'glyphicon ' + ( this.state.expanded ? 'glyphicon-chevron-down' : 'glyphicon-chevron-right' ),
            roomSummaryDisplay      = ( this.props.filtersActive ) ? 'none' : 'initial',
            filtersActiveDisplay    = ( this.props.filtersActive ) ? 'initial' : 'none';

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
                    <span className="filters-active" style={{ display: filtersActiveDisplay }}>Filter(s) active</span>
                </h2>
                <AreaTable units={this.props.units} buildings={g.buildings} expanded={this.state.expanded} filters={this.props.filters}  />
            </div>
        );
    }
});

var AreaTable = React.createClass({
    getInitialState: function() {
        var buildingsList = new Object();

        this.props.buildings.map( function( b ){
            buildingsList[ b ] = true;
        }, this );

        return { 
            buildingsFilter: buildingsList
        };
    },
    showPopover: function(e){
        e.preventDefault();
        jQuery(e.target).popover('show');
    },
    filterBuildings: function( e ){
        this.setState( previousState => {
            previousState.buildingsFilter[ e.target.name ] = e.target.checked;
            // console.log(previousState);
        });
    },
    renderBuildingsCheckboxes: function(b,i,a){
        return <BuildingsLine building={b} key={i} updateFilter={this.filterBuildings} checked={this.state.buildingsFilter[b]} />
    },
    tableLoaded: function(table){
        // this.areaTable = this;
        var thisTable = this;
        jQuery(table)
            .stickyTableHeaders({
                fixedOffset: ( hau_opts.is_user_logged_in ) ? 20 : 0
            })
            .on('enabledStickiness.stickyTableHeaders', function(){
                jQuery(this).addClass('headers-sticky');
            })
            .on('disabledStickiness.stickyTableHeaders', function(){
                jQuery(this).removeClass('headers-sticky');
            });                        
    },
    render: function(){
        var roomList = [];

        if( !this.props.expanded ){
            return <div />;
        }

        this.props.units.map( function( u, i ) {
            u.rooms.map( function( r, j ){
                roomList.push( <Room data={r} unit={u} key={r.roomID} activeBuildings={this.state.buildingsFilter} filters={this.props.filters} /> );
            }, this);
        }, this);

        return (
            <div className="bu_collapsible_section">
                <div className="buildings-list">
                    <h3>Buildings</h3>
                    <ul>
                        { this.props.buildings.map( this.renderBuildingsCheckboxes, this ) }
                    </ul>
                </div>
                <table style={{listStyleType:'none'}} ref={this.tableLoaded}>
                    <thead>
                        <tr>
                            <th><a href="#" onClick={this.showPopover} style={{display:'none'}} data-toggle="popover" title="Filter Locations">
                                <span className="glyphicon glyphicon-filter" aria-label="Click to Filter Locations"></span></a> Location</th>
                            <th>Floor</th>
                            <th>Unit #</th>
                            <th>Room Type</th>
                            <th>Room #</th>
                            <th>Spaces<br />Available</th>
                            <th>Gender</th>
                            <th>Specialty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roomList}
                    </tbody>
                </table>
            </div>
        );
    }
});
 
var Room = React.createClass({
    getInitialState: function() {
        return { 
            hidden          : ( !this.props.unit.unitAvailableSpaces ),
            recentlyTaken   : false,
            isFiltered      : false
        };
    },
    componentWillReceiveProps: function(nextProps){
        if( this.props.unit.unitAvailableSpaces > 0 && !nextProps.unit.unitAvailableSpaces ){
           this.setState({
               recentlyTaken : true
           }); 
        }
    },
    isRoomFiltered: function(){
        return (
            !this.props.activeBuildings[ this.props.unit.location ] ||
            !this.props.filters.roomTypes[ this.props.data.summaryRoomType ] ||
            !this.props.filters.roomMaxOcc[ this.props.data.roomTotalSpaces ] ||
            !this.props.filters.specialty[ this.props.unit.specialty ] ||
            !this.props.filters.genders[ this.props.unit.gender ]
        );
    },
    render: function(){
        var recentlyTakenClass = this.state.recentlyTaken ? ' booked ' : '',
            maybeVisible = ( this.isRoomFiltered() ) ? 'none' : '';

        // should be permanantly excluded from the list
        // different from "filtered", as those can be re-shown
        if( this.state.hidden ){
            return <tr />;
        }

        return (
            <tr className={recentlyTakenClass} style={{display:maybeVisible}}>
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
ReactDOM.render( <Housing />, document.getElementById('housing_table') );
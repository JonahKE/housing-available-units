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

var FilterBar = React.createClass({ 
    getInitialState: function() {
        return { 
            visible : false, 
            expanded : false, 
            maxHeight : '300px'
        };
    },
    toggleVisible: function(){
        this.setState( previousState => {
            previousState.visible = !previousState.visible;
        });
    },
    toggleExpanded: function(){
        this.setState( previousState => {
            if( previousState.expanded ){
                previousState.maxHeight = '300px';
                previousState.expanded = false;
            } else {
                previousState.maxHeight = 'none';
                previousState.expanded = true;
            }
        });
    },
    buildCheckboxLine: function( listName, currentItem ){
        var label = currentItem,
            displayCount = '(' + this.props.metaInfo[listName][currentItem] + ')',
            k = "checkbox_" + listName + "_" + currentItem;

        switch ( listName ){
            case 'housingCodes':
                if( '' == currentItem ){
                    label = 'Include units without specialty designation';
                    displayCount = '';
                }
                break;
        }

        return ( <div className="filter-box" key={k}><label><input type="checkbox" checked={this.props.filters[listName][currentItem]} name={listName} value={currentItem} onChange={this.props.updateFilters} /> {label} {displayCount}</label></div> );
    },
    render: function(){
        var f = this.props.filters,
            maybeVisible = ( this.state.visible ) ? 'block' : 'none',
            icon = (this.state.visible) ? 'glyphicon glyphicon-minus' : 'glyphicon glyphicon-plus',
            expandIcon = (this.state.expanded) ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down',
            expandText = (this.state.expanded) ? 'Collapse' : 'Expand';

        return (
                <div className="filter-container bu_collapsible_container" style={{ maxHeight : this.state.maxHeight, cursor: 'pointer' }}>
                    <h2 className="bu_collapsible" onClick={this.toggleVisible}><span className={icon} aria-label="Click to Filter Rooms"></span> Filter Rooms...</h2>
                    <div className="bu_collapsible_section" style={{display : maybeVisible}}>
                        <div className="filter-group">
                            <h3>Gender</h3>
                            { Object.keys(this.props.filters.genders).map( (s,i) => this.buildCheckboxLine( 'genders', s ) ) }
                        </div>
                        <div className="filter-group">
                            <h3>Room Size</h3>
                            { Object.keys(this.props.filters.roomSizes).map( (s,i) => this.buildCheckboxLine( 'roomSizes', s ) ) }

                        </div>
                        <div className="filter-group unit-type">
                            <h3>Unit Type</h3>
                            { Object.keys(this.props.filters.spaceTypes).map( (s,i) => this.buildCheckboxLine( 'spaceTypes', s ) ) }
                        </div>
                        <div className="filter-group specialty">
                            <h3>Specialty Housing</h3>
                            { Object.keys(this.props.filters.housingCodes).map( (s,i,a) => this.buildCheckboxLine( 'housingCodes', s ) ) }
                        </div>
                        <div className="filter-expand" onClick={this.toggleExpanded}>
                            <span className={expandIcon} aria-label="Click to expand filters"></span>
                            {expandText}
                            <span className={expandIcon} aria-label="Click to expand filters"></span>
                        </div>
                    </div>
                </div>
            );
    }
});

var BuildingsLine = React.createClass({ 
    render: function(){
        return (
                <li><label><input type="checkbox" name={this.props.building} checked={this.props.checked} onChange={this.props.updateFilter} /> {this.props.building}</label><br /></li>
            );
    }
});

var CurrentAsOf = React.createClass({ 
    render: function(){
        return (
                <div className='last-updated-container'>
                    <div className='loader'>
                        <div className="spinner">
                          <div className="double-bounce1"></div>
                          <div className="double-bounce2"></div>
                        </div>
                        <p>Updates automatically.<br />No need to refresh!</p>
                    </div>
                    <span className="last-updated">Last updated <span className="time" data-timestamp={this.props.lastUpdated}>{this.props.lastUpdated}</span></span>
                </div>
            );
    }
});

var Housing = React.createClass({
    mixins: [DisplayMixin],
    getInitialState: function() {
        var _state = { 
            areas               : _bootstrap.areas, 
            units               : _bootstrap.units, 
            roomCount           : _bootstrap.totalRoomCount, 
            isDataPending       : false, 
            dataPending         : null, 
            dataCreateTimestamp : _bootstrap.createTime,
            filtersActive       : false,
            specialtyOn         : false,
            allExpanded         : false,
            meta : {
                'genders'       : _bootstrap.gender,
                'housingCodes'  : _bootstrap.housingCodes,
                'roomSizes'     : _bootstrap.roomSize,
                'spaceTypes'    : _bootstrap.spaceTypes
            },
            filters : {
                'housingCodes'  : { '' : true },
                'genders'       : {},
                'roomSizes'     : {},
                'spaceTypes'    : {}
            }
        };
        
        Object.keys(_state.meta.genders).map(       (s,i) => { _state.filters['genders'][s] = true; } );
        Object.keys(_state.meta.housingCodes).map(  (s,i) => { _state.filters['housingCodes'][s] = false; } );
        Object.keys(_state.meta.roomSizes).map(     (s,i) => { 
                                                                _state.filters['roomSizes'][s] = true; 
                                                            } );
        Object.keys(_state.meta.spaceTypes).map(    (s,i) => { _state.filters['spaceTypes'][s] = true; } );

        return _state;
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
                this.setState({ 
                    areas: r.areas, 
                    lastDownloadTime: new Date(), 
                    dataCreateTimestamp: r.createTime,
                    meta : {
                        genders         : r.gender,
                        housingCodes    : r.housingCodes,
                        roomSizes       : r.roomSize,
                        spaceTypes      : r.spaceTypes
                    }
                });
            }
            document.getElementById( 'loader' ).className = '';
        }.bind(this)).always(function(){
            setTimeout( this.updateData, updateInterval * 1000 );
        });
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
                    previousState.specialtyOn = ( JSON.stringify( previousState.filters.housingCodes ) !== JSON.stringify( initial.filters.housingCodes ) );
                    previousState.filtersActive = ( JSON.stringify( previousState.filters ) !== JSON.stringify( initial.filters ) );
                });
        }
    },
    toggleAllExpanded: function(e){
        e.preventDefault();
        this.setState({ allExpanded: !this.state.allExpanded });
    },
    renderAreas: function(s,i,a) {
        return <Area group={s} units={s.units} key={s.areaID} name={s.areaID} filters={this.state.filters} filtersActive={this.state.filtersActive} specialtyOn={this.state.specialtyOn} allExpanded={this.state.allExpanded} />;
    },
    render: function(){
        var expandCollapseAllText = this.state.allExpanded ? 'Collapse' : 'Expand';
        return (
            <div className="housing-main">
                <CurrentAsOf lastUpdated={this.state.dataCreateTimestamp} />
                <FilterBar filters={this.state.filters} updateFilters={this.updateFilters} metaInfo={this.state.meta} />
                <div className="expand-collapse-all">
                    <a href="#" onClick={this.toggleAllExpanded}>{expandCollapseAllText} all sections</a>
                </div>
                { this.state.areas.map( (s,i,a) => this.renderAreas(s,i,a) ) }
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
    componentWillReceiveProps: function(nextProps){
        if( this.props.allExpanded !== nextProps.allExpanded ){
            this.setState({
                expanded : nextProps.allExpanded
            }); 
        }      
    },
    toggleShow: function(){
        this.setState({ expanded: !this.state.expanded });
    },
    render: function() {
        var g                       = this.props.group,
            aptText                 = this.maybePlural( g.spacesAvailableByType['Apt'], 'Apt' ),
            suiteText               = this.maybePlural( g.spacesAvailableByType['Suite'], 'Suite' ),
            semiSuiteText           = this.maybePlural( g.spacesAvailableByType['Semi-Suite'], 'Semi-Suite' ),
            studioText              = this.maybePlural( g.spacesAvailableByType['Studio'], 'Studio' ),
            dormText                = this.maybePlural( g.spacesAvailableByType['Dorm'], 'Dorm' ),
            arrow_icon              = 'glyphicon ' + ( this.state.expanded ? 'glyphicon-chevron-down' : 'glyphicon-chevron-right' ),
            roomSummaryDisplay      = ( this.props.filtersActive ) ? 'none' : 'initial',
            filtersActiveDisplay    = ( this.props.filtersActive ) ? 'initial' : 'none';

        return (
            <div className="housing_area bu_collapsible_container" style={{ overflow : 'hidden' }}>
                <h2 className="bu_collapsible" onClick={this.toggleShow} style={{ cursor: 'pointer' }}>
                    <span className={arrow_icon} aria-hidden="true"></span> &nbsp;
                    {this.props.name} &nbsp;
                    <span className="group-room-summary" style={{ display: roomSummaryDisplay }}>
                        Available: &nbsp;
                        {aptText} | &nbsp;
                        {suiteText} | &nbsp;
                        {semiSuiteText} | &nbsp;
                        {studioText} | &nbsp;
                        {dormText}
                    </span>
                    <span className="filters-active" style={{ display: filtersActiveDisplay }}>Filter(s) active</span>
                </h2>
                <AreaTable units={this.props.units} buildings={g.buildings} expanded={this.state.expanded} filters={this.props.filters} specialtyOn={this.props.specialtyOn} />
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
            specialtyOn : false,
            buildingsFilterExpanded: false,
            buildingsFilter: buildingsList
        };
    },
    componentWillReceiveProps: function(nextProps){
       this.setState({
           specialtyOn : ( JSON.stringify( this.props.filters.housingCodes ) !== JSON.stringify( nextProps.filters.housingCodes ) )
       }); 
    },
    toggleShowBuildingsFilter: function(e){
        e.preventDefault();
        this.setState({ buildingsFilterExpanded: !this.state.buildingsFilterExpanded });
    },
    filterBuildings: function( e ){
        this.setState( previousState => {
            previousState.buildingsFilter[ e.target.name ] = e.target.checked;
        });
    },
    renderBuildingsCheckboxes: function(b,i,a){
        return <BuildingsLine building={b} key={i} updateFilter={this.filterBuildings} checked={this.state.buildingsFilter[b]} />
    },
    buildUnit: function(u,i,a){
        return <Unit key={u.unitID} unitData={u} filters={this.props.filters} activeBuildings={this.state.buildingsFilter} specialtyOn={this.props.specialtyOn} />;
    },
    render: function(){
        var showSpecialty = 'none',
            maybeShowBuildingsFilter = this.state.buildingsFilterExpanded ? '' : 'none';

        if( this.props.specialtyOn ){
            showSpecialty = 'table-cell';
        }

        if( !this.props.expanded ){
            return <div />;
        }

        return (
            <div className="bu_collapsible_section">
                <div className="buildings-list">
                    <h3><a href="#" onClick={this.toggleShowBuildingsFilter}><span className="glyphicon glyphicon-filter"></span>Filter Buildings</a></h3>
                    <ul style={{display:maybeShowBuildingsFilter}}>
                        { this.props.buildings.map( this.renderBuildingsCheckboxes, this ) }
                    </ul>
                </div>
                <table>
                    <thead className="area-header-row">
                        <tr>
                            <th>&nbsp;</th>
                            <th>Location</th>
                            <th>Type</th>
                            <th>Floor</th>
                            <th>Unit #</th>
                            <th>Gender</th>
                            <th>Spaces Available</th>
                            <th style={{display:showSpecialty}}>Specialty</th>
                            <th style={{textAlign:'center'}}>Floorplan</th>
                        </tr>
                    </thead>
                    {this.props.units.map( (u,i,a) => this.buildUnit(u,i,a) )}
                </table>
            </div>
        );
    }
});
 
var Unit = React.createClass({ 
    getInitialState: function() {
        return { 
            hidden          : ( !this.props.unitData.availableSpaces ),
            recentlyTaken   : false,
            isFiltered      : this.isUnitFiltered(),
            detailsExpanded : false
        };
    },
    toggleExpanded: function(e){
        if( jQuery(e.target).parent().is('a') ){
            return;
        }
        this.setState({ detailsExpanded: !this.state.detailsExpanded });
    },
    componentWillReceiveProps: function(nextProps){
        this.setState({
            isFiltered : this.isUnitFiltered()
        });

        if( this.props.unitData.availableSpaces > 0 && !nextProps.unitData.availableSpaces ){
           this.setState({
               recentlyTaken : true
           }); 
        }
    },
    unitHasSpacesForFilteredSizes: function(spacesAvailableBySize){
        var hasAvailability = false;
        Object.keys( this.props.filters.roomSizes ).map( (s,i) => {
            if( !hasAvailability && 
                true === this.props.filters.roomSizes[ s ] &&
                spacesAvailableBySize[s] > 0 ){
                
                hasAvailability = true;
            }
        } );
        
        return hasAvailability;
    },
    isUnitFiltered: function(){
        return (
            !this.props.filters.spaceTypes[ this.props.unitData.unitType ] ||
            !this.props.activeBuildings[ this.props.unitData.location ] ||
            !this.props.filters.housingCodes[ this.props.unitData.specialty ] ||
            !this.props.filters.genders[ this.props.unitData.gender ] ||
            !this.unitHasSpacesForFilteredSizes( this.props.unitData.spacesAvailableBySize )
        );
    },
    render: function(){
        var recentlyTakenClass = this.state.recentlyTaken ? ' booked ' : '',
            maybeVisible = this.state.isFiltered ? 'none' : '',
            classN = 'unit-row ' + ( this.state.detailsExpanded ? 'expanded' : 'collapsed' ),
            expandIcon = 'glyphicon ' + ( this.state.detailsExpanded ? 'glyphicon-minus' : 'glyphicon-plus' ),
            floorplan = ( 0 !== this.props.unitData.floorplan.length ) ? <a href={this.props.unitData.floorplan} target="_blank"><span className="glyphicon glyphicon-picture"></span></a> : '',
            showSpecialty = 'none';

        classN = classN + recentlyTakenClass; 

        if( this.props.specialtyOn ){
            showSpecialty = 'table-cell';
        }

        // should be permanantly excluded from the list
        // different from "filtered", as those can be re-shown
        if( this.state.hidden ){
            return <tbody />;
        }

        return (
            <tbody style={{display:maybeVisible}} className={classN} onClick={this.toggleExpanded}>
                <tr> 
                    <td><span className={expandIcon} aria-hidden="true" aria-label="Expand unit details"></span></td>
                    <td>{this.props.unitData.location}</td>
                    <td>{this.props.unitData.unitType}</td>
                    <td>{this.props.unitData.floor}</td>
                    <td>{this.props.unitData.suite}</td>
                    <td>{this.props.unitData.gender}</td>
                    <td>{this.props.unitData.availableSpaces} of {this.props.unitData.totalSpaces}</td>
                    <td style={{display:showSpecialty}}>{this.props.unitData.specialty}</td>
                    <td>{floorplan}</td>
                </tr>
                <UnitDetails key={this.props.unitData.unitID} unit={this.props.unitData} expanded={this.state.detailsExpanded} />
            </tbody>
        );
    }
});

var UnitDetails = React.createClass({
    buildRooms: function(r,i,a){
        return <Room data={r} unit={this.props.unit} key={r.roomID} />;
    },
    render: function(){
        if( !this.props.expanded ){
            return <tr />;
        }
        return (
            <tr className='unit-details'>
                <td colSpan='9'>
                    <div className='unit-details-inner'>
                        <h4>All room(s) in this unit</h4>
                        <ul>
                            {this.props.unit.rooms.map( (r,i,a) => this.buildRooms(r,i,a) )}
                        </ul>
                    </div>
                </td>
            </tr>
        );
    }
});

var Room = React.createClass({
    render: function(){
        var classN = ( 0 == this.props.data.availableSpaces ) ? ' booked ' : '';

        return (
            <li className={classN}>
                {this.props.data.room} &middot; {this.props.data.roomSize} &middot; {this.props.data.availableSpaces} of {this.props.data.totalSpaces} spaces available
            </li>
        );
    }
});
ReactDOM.render( <Housing />, document.getElementById('housing_table') );
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

jQuery.ajaxSetup({ cache: false });

var updateInterval = 30;
var DisplayMixin = {
    maybePlural: function maybePlural(qty, singularLabel, pluralLabel) {
        if ('undefined' === typeof pluralLabel) {
            pluralLabel = singularLabel + 's';
        }
        return qty + ' ' + (qty == 1 ? singularLabel : pluralLabel);
    }
};

var FilterCheckbox = React.createClass({
    displayName: 'FilterCheckbox',

    render: function render() {
        return React.createElement(
            'label',
            null,
            React.createElement('input', { type: 'checkbox', checked: this.props.isChecked, name: this.props.category, value: this.props.name, onChange: this.props.updateFilters }),
            ' ',
            this.props.name
        );
    }
});

var FilterBar = React.createClass({
    displayName: 'FilterBar',

    getInitialState: function getInitialState() {
        return {
            visible: false
        };
    },
    toggleVisible: function toggleVisible() {
        this.setState(function (previousState) {
            previousState.visible = !previousState.visible;
        });
    },
    render: function render() {
        var f = this.props.filters,
            maybeVisible = this.state.visible ? 'block' : 'none',
            icon = this.state.visible ? 'glyphicon glyphicon-minus' : 'glyphicon glyphicon-plus';

        return React.createElement(
            'div',
            { className: 'filter-container bu_collapsible_container', style: { overflow: 'hidden' }, style: { cursor: 'pointer' } },
            React.createElement(
                'h2',
                { className: 'bu_collapsible', onClick: this.toggleVisible },
                React.createElement('span', { className: icon, 'aria-label': 'Click to Filter Rooms' }),
                ' Filter Rooms...'
            ),
            React.createElement(
                'div',
                { className: 'bu_collapsible_section', style: { display: maybeVisible } },
                React.createElement(
                    'div',
                    { className: 'filter-group' },
                    React.createElement(
                        'h3',
                        null,
                        'Gender'
                    ),
                    React.createElement(
                        'label',
                        null,
                        React.createElement('input', { type: 'checkbox', checked: f.genders.Female, name: 'genders', value: 'Female', onChange: this.props.updateFilters }),
                        ' Female'
                    ),
                    ' ',
                    React.createElement('br', null),
                    React.createElement(
                        'label',
                        null,
                        React.createElement('input', { type: 'checkbox', checked: f.genders.Male, name: 'genders', value: 'Male', onChange: this.props.updateFilters }),
                        ' Male'
                    ),
                    ' ',
                    React.createElement('br', null),
                    React.createElement(
                        'label',
                        null,
                        React.createElement('input', { type: 'checkbox', checked: f.genders['CoEd'], name: 'genders', value: 'CoEd', onChange: this.props.updateFilters }),
                        ' Gender Neutral'
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'filter-group' },
                    React.createElement(
                        'h3',
                        null,
                        'Room Size'
                    ),
                    React.createElement(
                        'label',
                        null,
                        React.createElement('input', { type: 'checkbox', checked: f.roomMaxOcc['1'], name: 'roomMaxOcc', value: '1', onChange: this.props.updateFilters }),
                        ' Single'
                    ),
                    ' ',
                    React.createElement('br', null),
                    React.createElement(
                        'label',
                        null,
                        React.createElement('input', { type: 'checkbox', checked: f.roomMaxOcc['2'], name: 'roomMaxOcc', value: '2', onChange: this.props.updateFilters }),
                        ' Double'
                    ),
                    ' ',
                    React.createElement('br', null),
                    React.createElement(
                        'label',
                        null,
                        React.createElement('input', { type: 'checkbox', checked: f.roomMaxOcc['3'], name: 'roomMaxOcc', value: '3', onChange: this.props.updateFilters }),
                        ' Triple'
                    ),
                    ' ',
                    React.createElement('br', null),
                    React.createElement(
                        'label',
                        null,
                        React.createElement('input', { type: 'checkbox', checked: f.roomMaxOcc['4'], name: 'roomMaxOcc', value: '4', onChange: this.props.updateFilters }),
                        ' Quad'
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'filter-group' },
                    React.createElement(
                        'h3',
                        null,
                        'Unit Type'
                    ),
                    React.createElement(
                        'label',
                        null,
                        React.createElement('input', { type: 'checkbox', checked: f.roomTypes['Apt'], name: 'roomTypes', value: 'Apt', onChange: this.props.updateFilters }),
                        ' Apt'
                    ),
                    React.createElement('br', null),
                    React.createElement(
                        'label',
                        null,
                        React.createElement('input', { type: 'checkbox', checked: f.roomTypes['Suite'], name: 'roomTypes', value: 'Suite', onChange: this.props.updateFilters }),
                        ' Suite'
                    ),
                    React.createElement('br', null),
                    React.createElement(
                        'label',
                        null,
                        React.createElement('input', { type: 'checkbox', checked: f.roomTypes['Studio'], name: 'roomTypes', value: 'Studio', onChange: this.props.updateFilters }),
                        ' Studio'
                    ),
                    React.createElement('br', null),
                    React.createElement(
                        'label',
                        null,
                        React.createElement('input', { type: 'checkbox', checked: f.roomTypes['Dorm'], name: 'roomTypes', value: 'Dorm', onChange: this.props.updateFilters }),
                        ' Dorm'
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'filter-group' },
                    React.createElement(
                        'h3',
                        null,
                        'Specialty Housing'
                    )
                )
            )
        );
    }
});

var BuildingsLine = React.createClass({
    displayName: 'BuildingsLine',

    render: function render() {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'label',
                null,
                React.createElement('input', { type: 'checkbox', name: this.props.building, checked: this.props.checked, onChange: this.props.updateFilter }),
                ' ',
                this.props.building
            ),
            React.createElement('br', null)
        );
    }
});

var CurrentAsOf = React.createClass({
    displayName: 'CurrentAsOf',

    render: function render() {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'span',
                { className: 'last-updated' },
                'Last updated ',
                React.createElement(
                    'span',
                    { className: 'time', 'data-timestamp': this.props.lastUpdated },
                    this.props.lastUpdated
                )
            )
        );
    }
});

var Housing = React.createClass({
    displayName: 'Housing',

    mixins: [DisplayMixin],
    getInitialState: function getInitialState() {
        return {
            // title               : hau_opts._bootstrap.metaData.name,
            areas: _bootstrap.areas,
            units: _bootstrap.units,
            roomCount: _bootstrap.totalRoomCount,
            isDataPending: false,
            dataPending: null,
            dataCreateTimestamp: _bootstrap.createTime,
            filtersActive: false,
            filters: {
                'roomMaxOcc': {
                    '1': true,
                    '2': true,
                    '3': true,
                    '4': true
                },
                'specialty': {
                    '': true,
                    'Chinese House': true,
                    'Special House One': true
                },
                'roomTypes': {
                    'Apt': true,
                    'Suite': true,
                    'Studio': true,
                    'Dorm': true
                },
                'genders': {
                    'Male': true,
                    'Female': true,
                    'CoEd': true
                }
            }
        };
    },
    componentDidMount: function componentDidMount() {
        document.getElementById('loader').className = '';
        setTimeout(this.updateData, updateInterval * 1000);
    },
    updateData: function updateData() {
        document.getElementById('loader').className = 'active';

        jQuery.getJSON(hau_opts.ajaxurl, { action: 'housing_availability' }, (function (r) {
            var now = new Date();
            if (r.hasOwnProperty('areas')) {
                // this.setState({ isDataPending: true, dataPending: r, lastDownloadTime: now.toISOString() })
                this.setState({ areas: r.areas, lastDownloadTime: new Date(), dataCreateTimestamp: r.createTime });
            }
            document.getElementById('loader').className = '';
            setTimeout(this.updateData, updateInterval * 1000);
        }).bind(this));
    },
    updateFilters: function updateFilters(e) {
        var _this = this;

        var filterGroup = e.target.name,
            filterProp = e.target.value,
            filterValue = e.target.checked;

        switch (e.target.type) {
            case 'checkbox':
                this.setState(function (previousState) {
                    var initial = _this.getInitialState();

                    previousState.filters[filterGroup][filterProp] = filterValue;
                    previousState.filtersActive = JSON.stringify(previousState.filters) !== JSON.stringify(initial.filters);
                });
        }
    },
    renderAreas: function renderAreas(s, i, a) {
        return React.createElement(Area, { group: s, units: s.units, key: s.areaID, name: s.areaID, filters: this.state.filters, filtersActive: this.state.filtersActive });
    },
    render: function render() {
        return React.createElement(
            'div',
            null,
            React.createElement(CurrentAsOf, { lastUpdated: this.state.dataCreateTimestamp }),
            React.createElement(FilterBar, { filters: this.state.filters, updateFilters: this.updateFilters }),
            this.state.areas.map(this.renderAreas, this)
        );
    }
});

var Area = React.createClass({
    displayName: 'Area',

    mixins: [DisplayMixin],
    getInitialState: function getInitialState() {
        var buildingsList = new Object();

        this.props.group.buildings.map(function (b) {
            buildingsList[b] = true;
        }, this);

        return {
            expanded: false,
            buildingsFilter: buildingsList
        };
    },
    toggleShow: function toggleShow() {
        this.setState({ expanded: !this.state.expanded });
    },
    render: function render() {
        // console.log(this.state.buildingsFilter);
        var g = this.props.group,
            aptText = this.maybePlural(g.spacesAvailableByType.Apt, 'Apt'),
            suiteText = this.maybePlural(g.spacesAvailableByType.Suite, 'suite'),
            dormText = this.maybePlural(g.spacesAvailableByType.Dorm, 'dorm'),
            unitsText = this.maybePlural(this.props.group.availableSpaceCount, 'unit'),
            arrow_icon = 'glyphicon ' + (this.state.expanded ? 'glyphicon-chevron-down' : 'glyphicon-chevron-right'),
            roomSummaryDisplay = this.props.filtersActive ? 'none' : 'initial',
            filtersActiveDisplay = this.props.filtersActive ? 'initial' : 'none';

        return React.createElement(
            'div',
            { className: 'bu_collapsible_container', style: { overflow: 'hidden' } },
            React.createElement(
                'h2',
                { className: 'bu_collapsible', onClick: this.toggleShow, style: { cursor: 'pointer' } },
                React.createElement('span', { className: arrow_icon, 'aria-hidden': 'true' }),
                '  ',
                this.props.name,
                '  ',
                React.createElement(
                    'span',
                    { className: 'group-room-summary', style: { display: roomSummaryDisplay } },
                    unitsText,
                    ' available:  ',
                    aptText,
                    ' |  ',
                    suiteText,
                    ' |  ',
                    dormText
                ),
                React.createElement(
                    'span',
                    { className: 'filters-active', style: { display: filtersActiveDisplay } },
                    'Filter(s) active'
                )
            ),
            React.createElement(AreaTable, { units: this.props.units, buildings: g.buildings, expanded: this.state.expanded, filters: this.props.filters })
        );
    }
});

var AreaTable = React.createClass({
    displayName: 'AreaTable',

    getInitialState: function getInitialState() {
        var buildingsList = new Object();

        this.props.buildings.map(function (b) {
            buildingsList[b] = true;
        }, this);

        return {
            buildingsFilter: buildingsList
        };
    },
    showPopover: function showPopover(e) {
        e.preventDefault();
        jQuery(e.target).popover('show');
    },
    filterBuildings: function filterBuildings(e) {
        this.setState(function (previousState) {
            previousState.buildingsFilter[e.target.name] = e.target.checked;
            // console.log(previousState);
        });
    },
    renderBuildingsCheckboxes: function renderBuildingsCheckboxes(b, i, a) {
        return React.createElement(BuildingsLine, { building: b, key: i, updateFilter: this.filterBuildings, checked: this.state.buildingsFilter[b] });
    },
    tableLoaded: function tableLoaded(table) {
        // this.areaTable = this;
        var thisTable = this;
        jQuery(table).stickyTableHeaders({
            fixedOffset: hau_opts.is_user_logged_in ? 20 : 0
        }).on('enabledStickiness.stickyTableHeaders', function () {
            jQuery(this).addClass('headers-sticky');
        }).on('disabledStickiness.stickyTableHeaders', function () {
            jQuery(this).removeClass('headers-sticky');
        });
    },
    render: function render() {
        var roomList = [];

        if (!this.props.expanded) {
            return React.createElement('div', null);
        }

        this.props.units.map(function (u, i) {
            u.rooms.map(function (r, j) {
                roomList.push(React.createElement(Room, { data: r, unit: u, key: r.roomID, activeBuildings: this.state.buildingsFilter, filters: this.props.filters }));
            }, this);
        }, this);

        return React.createElement(
            'div',
            { className: 'bu_collapsible_section' },
            React.createElement(
                'div',
                { className: 'buildings-list' },
                React.createElement(
                    'h3',
                    null,
                    'Buildings'
                ),
                React.createElement(
                    'ul',
                    null,
                    this.props.buildings.map(this.renderBuildingsCheckboxes, this)
                )
            ),
            React.createElement(
                'table',
                { style: { listStyleType: 'none' }, ref: this.tableLoaded },
                React.createElement(
                    'thead',
                    null,
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            null,
                            React.createElement(
                                'a',
                                { href: '#', onClick: this.showPopover, style: { display: 'none' }, 'data-toggle': 'popover', title: 'Filter Locations' },
                                React.createElement('span', { className: 'glyphicon glyphicon-filter', 'aria-label': 'Click to Filter Locations' })
                            ),
                            ' Location'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Floor'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Unit #'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Room Type'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Room #'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Spaces',
                            React.createElement('br', null),
                            'Available'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Gender'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Specialty'
                        )
                    )
                ),
                React.createElement(
                    'tbody',
                    null,
                    roomList
                )
            )
        );
    }
});

var Room = React.createClass({
    displayName: 'Room',

    getInitialState: function getInitialState() {
        return {
            hidden: !this.props.unit.unitAvailableSpaces,
            recentlyTaken: false,
            isFiltered: false
        };
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        if (this.props.unit.unitAvailableSpaces > 0 && !nextProps.unit.unitAvailableSpaces) {
            this.setState({
                recentlyTaken: true
            });
        }
    },
    isRoomFiltered: function isRoomFiltered() {
        return !this.props.activeBuildings[this.props.unit.location] || !this.props.filters.roomTypes[this.props.data.summaryRoomType] || !this.props.filters.roomMaxOcc[this.props.data.roomTotalSpaces] || !this.props.filters.specialty[this.props.unit.specialty] || !this.props.filters.genders[this.props.unit.gender];
    },
    render: function render() {
        var recentlyTakenClass = this.state.recentlyTaken ? ' booked ' : '',
            maybeVisible = this.isRoomFiltered() ? 'none' : '';

        // should be permanantly excluded from the list
        // different from "filtered", as those can be re-shown
        if (this.state.hidden) {
            return React.createElement('tr', null);
        }

        return React.createElement(
            'tr',
            { className: recentlyTakenClass, style: { display: maybeVisible } },
            React.createElement(
                'td',
                null,
                this.props.unit.location
            ),
            React.createElement(
                'td',
                null,
                this.props.unit.floor
            ),
            React.createElement(
                'td',
                null,
                this.props.unit.unitID
            ),
            React.createElement(
                'td',
                null,
                this.props.data.roomType
            ),
            React.createElement(
                'td',
                null,
                this.props.data.room
            ),
            React.createElement(
                'td',
                null,
                this.props.unit.unitAvailableSpaces,
                ' of ',
                this.props.unit.unitTotalSpaces
            ),
            React.createElement(
                'td',
                null,
                this.props.unit.gender
            ),
            React.createElement(
                'td',
                null,
                this.props.unit.specialty
            )
        );
    }
});
ReactDOM.render(React.createElement(Housing, null), document.getElementById('housing_table'));

},{}]},{},[1]);

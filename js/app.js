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

var RoomSizeMixin = {
    roomSizeMapToInt: function roomSizeMapToInt(roomSize) {
        switch (roomSize) {
            case 'Single':
                return 1;
            case 'Double':
                return 2;
            case 'Triple':
                return 3;
            case 'Quad':
                return 4;
        }
    },
    roomSizeMapFromInt: function roomSizeMapFromInt(i) {
        switch (i) {
            case 1:
                return 'Single';
            case 2:
                return 'Double';
            case 3:
                return 'Triple';
            case 4:
                return 'Quad';
        }
    }
};

var FilterBar = React.createClass({
    displayName: 'FilterBar',

    mixins: [RoomSizeMixin],
    getInitialState: function getInitialState() {
        return {
            visible: false,
            expanded: false,
            maxHeight: '300px'
        };
    },
    toggleVisible: function toggleVisible() {
        this.setState(function (previousState) {
            previousState.visible = !previousState.visible;
        });
    },
    toggleExpanded: function toggleExpanded() {
        this.setState(function (previousState) {
            if (previousState.expanded) {
                previousState.maxHeight = '300px';
                previousState.expanded = false;
            } else {
                previousState.maxHeight = 'none';
                previousState.expanded = true;
            }
        });
    },
    buildCheckboxLine: function buildCheckboxLine(listName, currentItem) {
        var label = currentItem,
            displayCount = '(' + this.props.metaInfo[listName][currentItem] + ')',
            k = "checkbox_" + listName + "_" + currentItem;

        switch (listName) {
            case 'housingCodes':
                if ('' == currentItem) {
                    label = 'Show standard rooms';
                    displayCount = '';
                }
                break;
        }

        return React.createElement(
            'div',
            { className: 'filter-box', key: k },
            React.createElement(
                'label',
                null,
                React.createElement('input', { type: 'checkbox', checked: this.props.filters[listName][currentItem], name: listName, value: currentItem, onChange: this.props.updateFilters }),
                ' ',
                label,
                ' ',
                displayCount
            )
        );
    },
    render: function render() {
        var _this = this;

        var f = this.props.filters,
            maybeVisible = this.state.visible ? 'block' : 'none',
            icon = this.state.visible ? 'glyphicon glyphicon-minus' : 'glyphicon glyphicon-plus',
            expandIcon = this.state.expanded ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down',
            expandText = this.state.expanded ? 'Collapse' : 'Expand';

        return React.createElement(
            'div',
            { className: 'filter-container bu_collapsible_container', style: { maxHeight: this.state.maxHeight, cursor: 'pointer' } },
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
                    Object.keys(this.props.filters.genders).map(function (s, i) {
                        return _this.buildCheckboxLine('genders', s);
                    })
                ),
                React.createElement(
                    'div',
                    { className: 'filter-group' },
                    React.createElement(
                        'h3',
                        null,
                        'Room Size'
                    ),
                    Object.keys(this.props.filters.roomSizes).map(function (s, i) {
                        return _this.buildCheckboxLine('roomSizes', s);
                    })
                ),
                React.createElement(
                    'div',
                    { className: 'filter-group unit-type' },
                    React.createElement(
                        'h3',
                        null,
                        'Unit Type'
                    ),
                    Object.keys(this.props.filters.spaceTypes).map(function (s, i) {
                        return _this.buildCheckboxLine('spaceTypes', s);
                    })
                ),
                React.createElement(
                    'div',
                    { className: 'filter-group specialty' },
                    React.createElement(
                        'h3',
                        null,
                        'Specialty Housing'
                    ),
                    Object.keys(this.props.filters.housingCodes).map(function (s, i, a) {
                        return _this.buildCheckboxLine('housingCodes', s);
                    })
                ),
                React.createElement(
                    'div',
                    { className: 'filter-expand', onClick: this.toggleExpanded },
                    React.createElement('span', { className: expandIcon, 'aria-label': 'Click to expand filters' }),
                    expandText,
                    React.createElement('span', { className: expandIcon, 'aria-label': 'Click to expand filters' })
                )
            )
        );
    }
});

var BuildingsLine = React.createClass({
    displayName: 'BuildingsLine',

    render: function render() {
        return React.createElement(
            'li',
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

    mixins: [DisplayMixin, RoomSizeMixin],
    getInitialState: function getInitialState() {
        var _state = {
            // title               : hau_opts._bootstrap.metaData.name,
            areas: _bootstrap.areas,
            units: _bootstrap.units,
            roomCount: _bootstrap.totalRoomCount,
            isDataPending: false,
            dataPending: null,
            dataCreateTimestamp: _bootstrap.createTime,
            filtersActive: false,
            specialtyOn: false,
            meta: {
                'genders': _bootstrap.gender,
                'housingCodes': _bootstrap.housingCodes,
                'roomSizes': _bootstrap.roomSize,
                'spaceTypes': _bootstrap.spaceTypes
            },
            filters: {
                'housingCodes': { '': true },
                'genders': {},
                'roomSizes': {},
                'spaceTypes': {}
            }
        };

        Object.keys(_state.meta.genders).map(function (s, i) {
            _state.filters['genders'][s] = true;
        });
        Object.keys(_state.meta.housingCodes).map(function (s, i) {
            _state.filters['housingCodes'][s] = false;
        });
        Object.keys(_state.meta.roomSizes).map(function (s, i) {
            _state.filters['roomSizes'][s] = true;
        });
        Object.keys(_state.meta.spaceTypes).map(function (s, i) {
            _state.filters['spaceTypes'][s] = true;
        });

        return _state;
    },
    componentDidMount: function componentDidMount() {
        document.getElementById('loader').className = '';
        setTimeout(this.updateData, updateInterval * 1000);
    },
    updateData: function updateData() {
        document.getElementById('loader').className = 'active';

        jQuery.getJSON(hau_opts.units_json, (function (r) {
            var now = new Date();
            if (r.hasOwnProperty('areas')) {
                // this.setState({ isDataPending: true, dataPending: r, lastDownloadTime: now.toISOString() })
                this.setState({
                    areas: r.areas,
                    lastDownloadTime: new Date(),
                    dataCreateTimestamp: r.createTime,
                    meta: {
                        genders: r.gender,
                        housingCodes: r.housingCodes,
                        roomSizes: r.roomSize,
                        spaceTypes: r.spaceTypes
                    }
                });
            }
            document.getElementById('loader').className = '';
            setTimeout(this.updateData, updateInterval * 1000);
        }).bind(this));
    },
    updateFilters: function updateFilters(e) {
        var _this2 = this;

        var filterGroup = e.target.name,
            filterProp = e.target.value,
            filterValue = e.target.checked;

        switch (e.target.type) {
            case 'checkbox':
                this.setState(function (previousState) {
                    var initial = _this2.getInitialState();

                    previousState.filters[filterGroup][filterProp] = filterValue;
                    previousState.specialtyOn = JSON.stringify(previousState.filters.housingCodes) !== JSON.stringify(initial.filters.housingCodes);
                    previousState.filtersActive = JSON.stringify(previousState.filters) !== JSON.stringify(initial.filters);
                });
        }
    },
    renderAreas: function renderAreas(s, i, a) {
        return React.createElement(Area, { group: s, units: s.units, key: s.areaID, name: s.areaID, filters: this.state.filters, filtersActive: this.state.filtersActive, specialtyOn: this.state.specialtyOn });
    },
    render: function render() {
        var _this3 = this;

        return React.createElement(
            'div',
            null,
            React.createElement(CurrentAsOf, { lastUpdated: this.state.dataCreateTimestamp }),
            React.createElement(FilterBar, { filters: this.state.filters, updateFilters: this.updateFilters, metaInfo: this.state.meta }),
            this.state.areas.map(function (s, i, a) {
                return _this3.renderAreas(s, i, a);
            })
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
            suiteText = this.maybePlural(g.spacesAvailableByType.Suite, 'Suite'),
            semiText = this.maybePlural(g.spacesAvailableByType.Semi, 'Semi'),
            dormText = this.maybePlural(g.spacesAvailableByType.Dorm, 'Dorm'),
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
                    semiText,
                    ' |  ',
                    dormText
                ),
                React.createElement(
                    'span',
                    { className: 'filters-active', style: { display: filtersActiveDisplay } },
                    'Filter(s) active'
                )
            ),
            React.createElement(AreaTable, { units: this.props.units, buildings: g.buildings, expanded: this.state.expanded, filters: this.props.filters, specialtyOn: this.props.specialtyOn })
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
            specialtyOn: false,
            buildingsFilter: buildingsList
        };
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        this.setState({
            specialtyOn: JSON.stringify(this.props.filters.housingCodes) !== JSON.stringify(nextProps.filters.housingCodes)
        });
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
        jQuery(table).stickyTableHeaders({
            fixedOffset: hau_opts.is_user_logged_in ? 20 : 0
        }).on('enabledStickiness.stickyTableHeaders', function () {
            jQuery(this).addClass('headers-sticky');
        }).on('disabledStickiness.stickyTableHeaders', function () {
            jQuery(this).removeClass('headers-sticky');
        });
    },
    buildUnit: function buildUnit(u, i, a) {
        return React.createElement(Unit, { key: u.unitID, unitData: u, filters: this.props.filters, activeBuildings: this.state.buildingsFilter, specialtyOn: this.props.specialtyOn });
    },
    render: function render() {
        var _this4 = this;

        var showSpecialty = 'none';

        if (this.props.specialtyOn) {
            showSpecialty = 'table-cell';
        }

        if (!this.props.expanded) {
            return React.createElement('div', null);
        }

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
                { ref: this.tableLoaded },
                React.createElement(
                    'thead',
                    { className: 'area-header-row' },
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            null,
                            ' '
                        ),
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
                            'Type'
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
                            'Gender'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Spaces Available'
                        ),
                        React.createElement(
                            'th',
                            { style: { display: showSpecialty } },
                            'Specialty'
                        ),
                        React.createElement(
                            'th',
                            { style: { textAlign: 'center' } },
                            'Floorplan'
                        )
                    )
                ),
                this.props.units.map(function (u, i, a) {
                    return _this4.buildUnit(u, i, a);
                })
            )
        );
    }
});

var Unit = React.createClass({
    displayName: 'Unit',

    getInitialState: function getInitialState() {
        return {
            hidden: !this.props.unitData.availableSpaces,
            recentlyTaken: false,
            isFiltered: false,
            detailsExpanded: false
        };
    },
    toggleExpanded: function toggleExpanded(e) {
        if (jQuery(e.target).parent().is('a')) {
            return;
        }

        this.setState(function (previousState) {
            if (previousState.detailsExpanded) {
                // previousState.maxHeight = '300px';
                previousState.detailsExpanded = false;
            } else {
                // previousState.maxHeight = 'none';
                previousState.detailsExpanded = true;
            }
        });
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        if (this.props.unitData.availableSpaces > 0 && !nextProps.unitData.availableSpaces) {
            this.setState({
                recentlyTaken: true
            });
        }
    },
    isUnitFiltered: function isUnitFiltered() {
        return !this.props.filters.spaceTypes[this.props.unitData.unitType] || !this.props.activeBuildings[this.props.unitData.location] || !this.props.filters.housingCodes[this.props.unitData.specialty] || !this.props.filters.genders[this.props.unitData.gender];
    },
    render: function render() {
        var recentlyTakenClass = this.state.recentlyTaken ? ' booked ' : '',
            maybeVisible = this.isUnitFiltered() ? 'none' : '',
            classN = 'unit-row ' + (this.state.detailsExpanded ? 'expanded' : 'collapsed'),
            expandIcon = 'glyphicon ' + (this.state.detailsExpanded ? 'glyphicon-minus' : 'glyphicon-plus'),
            floorplan = 0 !== this.props.unitData.floorplan.length ? React.createElement(
            'a',
            { href: this.props.unitData.floorplan, target: '_blank' },
            React.createElement('span', { className: 'glyphicon glyphicon-picture' })
        ) : '',
            showSpecialty = 'none';

        classN = classN + recentlyTakenClass;

        if (this.props.specialtyOn) {
            showSpecialty = 'table-cell';
        }

        // should be permanantly excluded from the list
        // different from "filtered", as those can be re-shown
        if (this.state.hidden) {
            return React.createElement('tr', null);
        }

        return React.createElement(
            'tbody',
            { style: { display: maybeVisible }, className: classN, onClick: this.toggleExpanded },
            React.createElement(
                'tr',
                null,
                React.createElement(
                    'td',
                    null,
                    React.createElement('span', { className: expandIcon, 'aria-hidden': 'true', 'aria-label': 'Expand unit details' })
                ),
                React.createElement(
                    'td',
                    null,
                    this.props.unitData.location
                ),
                React.createElement(
                    'td',
                    null,
                    this.props.unitData.unitType
                ),
                React.createElement(
                    'td',
                    null,
                    this.props.unitData.floor
                ),
                React.createElement(
                    'td',
                    null,
                    this.props.unitData.suite
                ),
                React.createElement(
                    'td',
                    null,
                    this.props.unitData.gender
                ),
                React.createElement(
                    'td',
                    null,
                    this.props.unitData.availableSpaces,
                    ' of ',
                    this.props.unitData.totalSpaces
                ),
                React.createElement(
                    'td',
                    { style: { display: showSpecialty } },
                    this.props.unitData.specialty
                ),
                React.createElement(
                    'td',
                    null,
                    floorplan
                )
            ),
            React.createElement(UnitDetails, { key: this.props.unitData.unitID, unit: this.props.unitData, expanded: this.state.detailsExpanded })
        );
    }
});

var UnitDetails = React.createClass({
    displayName: 'UnitDetails',

    buildRooms: function buildRooms(r, i, a) {
        return React.createElement(Room, { data: r, unit: this.props.unit, key: r.roomID });
    },
    render: function render() {
        var _this5 = this;

        if (!this.props.expanded) {
            return React.createElement('tr', null);
        }
        return React.createElement(
            'tr',
            { className: 'unit-details' },
            React.createElement(
                'td',
                { colSpan: '9' },
                React.createElement(
                    'h4',
                    null,
                    'All Rooms'
                ),
                React.createElement(
                    'ul',
                    null,
                    this.props.unit.rooms.map(function (r, i, a) {
                        return _this5.buildRooms(r, i, a);
                    })
                )
            )
        );
    }
});

var Room = React.createClass({
    displayName: 'Room',

    mixins: [RoomSizeMixin],
    isRoomFiltered: function isRoomFiltered() {
        return false;
        return !this.props.filters.roomSizes[this.roomSizeMapFromInt(this.props.data.totalSpaces)];
    },
    render: function render() {
        var classN = 0 == this.props.data.availableSpaces ? ' booked ' : '';

        return React.createElement(
            'li',
            { className: classN },
            this.props.data.room,
            ' · ',
            this.props.data.roomSize,
            ' · ',
            this.props.data.availableSpaces,
            ' of ',
            this.props.data.totalSpaces,
            ' spaces available'
        );
    }
});
ReactDOM.render(React.createElement(Housing, null), document.getElementById('housing_table'));

},{}]},{},[1]);

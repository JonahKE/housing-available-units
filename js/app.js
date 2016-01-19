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

var Ticker = React.createClass({
    displayName: 'Ticker',

    getInitialState: function getInitialState() {
        return {
            secondsLeft: updateInterval
        };
    },
    tick: function tick() {
        if (!this.isMounted()) {
            return;
        }
        var left = this.state.secondsLeft - 1;

        // this.updateMoment();

        if (left != parseInt(left) || 0 >= left) {
            this.stopTicking();
            return;
        }
        this.setState({ secondsLeft: left });
    },
    updateMoment: function updateMoment() {
        var timeSince = document.querySelector('.last-updated .time'),
            newText;

        if (undefined === timeSince.dataset.timestamp) {
            return;
        }

        newText = moment(timeSince.dataset.timestamp).fromNow();

        if (newText == timeSince.innerHTML) {
            return;
        }

        timeSince.innerHTML = newText;
    },
    startTicking: function startTicking(t) {
        if (!this.isMounted()) {
            return;
        }

        if (t !== updateInterval) {
            this.setState({ secondsLeft: t });
        }

        this.interval = setInterval(this.tick, 1000);
    },
    stopTicking: function stopTicking() {
        clearInterval(this.interval);
        if (!this.isMounted()) {
            return;
        }
        this.setState({ secondsLeft: 'NOW' });
    },
    render: function render() {
        return React.createElement(
            'div',
            null,
            'Updates in: ',
            this.state.secondsLeft
        );
    }
});
//var theTicker = React.render( <Ticker />, document.getElementById('ticker') );

var FilterBar = React.createClass({
    displayName: 'FilterBar',

    render: function render() {
        var f = this.props.filters;

        return React.createElement(
            'div',
            { className: 'filter-container' },
            React.createElement(
                'h2',
                null,
                'Filter by...'
            ),
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
                    React.createElement('input', { type: 'checkbox', checked: f.genders['Gender Neutral'], name: 'genders', value: 'Gender Neutral', onChange: this.props.updateFilters }),
                    ' Gender Neutral'
                )
            ),
            React.createElement(
                'div',
                { className: 'filter-group' },
                React.createElement(
                    'h3',
                    null,
                    'Room Size ',
                    React.createElement('br', null),
                    ' ',
                    React.createElement(
                        'span',
                        { style: { fontSize: '0.5em', fontStyle: 'italic' } },
                        'Not 100% accurate (due to limitations of sample data)'
                    )
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
                    React.createElement('input', { type: 'checkbox', checked: f.roomTypes['Apartment'], name: 'roomTypes', value: 'Apartment', onChange: this.props.updateFilters }),
                    ' Apartment'
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
                    React.createElement('input', { type: 'checkbox', checked: f.roomTypes['Dormitory'], name: 'roomTypes', value: 'Dormitory', onChange: this.props.updateFilters }),
                    ' Dormitory'
                )
            ),
            React.createElement(
                'div',
                { className: 'filter-group' },
                React.createElement(
                    'h3',
                    null,
                    'Specialty Housing ',
                    React.createElement('br', null),
                    ' ',
                    React.createElement(
                        'span',
                        { style: { fontSize: '0.5em', fontStyle: 'italic' } },
                        'Work in progress'
                    )
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
            title: _bootstrap.metaData.name,
            areas: _bootstrap.areas,
            units: _bootstrap.units,
            roomCount: _bootstrap.totalRoomCount,
            isDataPending: false,
            dataPending: null,
            lastDownloadTime: new Date(),
            filtersActive: false,
            filters: {
                'roomMaxOcc': {
                    '1': true,
                    '2': true,
                    '3': true,
                    '4': true
                },
                'specialty': {
                    'Chinese House': true,
                    'Special House One': true
                },
                'roomTypes': {
                    'Apartment': true,
                    'Suite': true,
                    'Dormitory': true
                },
                'genders': {
                    'Male': true,
                    'Female': true,
                    'Gender Neutral': true
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

        $.getJSON('http://awbauer.cms-devl.bu.edu/non-wp/housing/units.json.php', (function (r) {
            var now = new Date();
            if (r.hasOwnProperty('areas')) {
                // this.setState({ isDataPending: true, dataPending: r, lastDownloadTime: now.toISOString() })
                this.setState({ areas: r.areas, lastDownloadTime: new Date() });
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
        return React.createElement(Area, { group: s, units: s.units, key: s.id, filters: this.state.filters, filtersActive: this.state.filtersActive });
    },
    render: function render() {
        var applyDataDisplay = this.state.isDataPending ? '' : 'none',
            timestampISO = this.state.lastDownloadTime.toISOString(),
            friendlyTimestamp = moment(timestampISO).fromNow(),
            areasText = this.maybePlural(this.state.areas.length, 'area'),
            unitsText = this.maybePlural(this.state.roomCount, 'unit');
        return React.createElement(
            'div',
            null,
            React.createElement(
                'span',
                { className: 'last-updated' },
                'Last updated ',
                React.createElement(
                    'span',
                    { className: 'time', 'data-timestamp': timestampISO },
                    friendlyTimestamp
                )
            ),
            React.createElement(
                'div',
                { className: 'loaded-units-count' },
                'Loaded ',
                areasText,
                ' containing ',
                unitsText
            ),
            React.createElement(FilterBar, { filters: this.state.filters, updateFilters: this.updateFilters }),
            this.state.areas.map(this.renderAreas, this)
        );
    }
});

var Area = React.createClass({
    displayName: 'Area',

    mixins: [DisplayMixin],
    getInitialState: function getInitialState() {
        return {
            expanded: false
        };
    },
    toggleShow: function toggleShow() {
        this.setState({ expanded: !this.state.expanded });
    },
    render: function render() {
        var g = this.props.group,
            aptText = this.maybePlural(g.spacesAvailableByType.Apartment, 'apartment'),
            suiteText = this.maybePlural(g.spacesAvailableByType.Suite, 'suite'),
            dormText = this.maybePlural(g.spacesAvailableByType.Dormitory, 'dorm'),
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
                this.props.group.name,
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
            React.createElement(AreaTable, { units: this.props.units, expanded: this.state.expanded, filters: this.props.filters })
        );
    }
});

var AreaTable = React.createClass({
    displayName: 'AreaTable',

    showPopover: function showPopover(e) {
        console.log(e);
        // jQuery(e).popover('show');
    },
    isRoomVisible: function isRoomVisible(unit, room) {
        // console.log(this.props.filters);
        return this.props.filters.roomTypes[room.summaryRoomType] && this.props.filters.roomMaxOcc[room.roomTotalSpaces] && this.props.filters.specialty[unit.specialty] && this.props.filters.genders[unit.gender];
    },
    render: function render() {
        var rooms = [],
            locationsPopover;

        if (!this.props.expanded) {
            console.log(locationsPopover);
            return React.createElement('div', null);
        }

        this.props.units.map(function (u, i) {
            var maybeTakenClass = u.unitAvailableSpaces > 0 ? '' : ' booked ';
            u.rooms.map(function (r, j) {
                if (this.isRoomVisible(u, r)) {
                    rooms.push(React.createElement(Room, { data: r, unit: u, key: r.id, recentlyTakenClass: maybeTakenClass }));
                }
            }, this);
        }, this);

        return React.createElement(
            'div',
            { className: 'bu_collapsible_section' },
            React.createElement(
                'table',
                { style: { listStyleType: 'none' } },
                React.createElement(
                    'thead',
                    null,
                    React.createElement(
                        'th',
                        null,
                        React.createElement(
                            'a',
                            { href: '#', onClick: this.showPopover, 'data-container': 'body', ref: function (e) {
                                    if (e != null) {
                                        jQuery(e).popover();
                                    }
                                } },
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
                        '# Spaces Available'
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
                ),
                React.createElement(
                    'tbody',
                    null,
                    rooms
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
            recentlyTaken: false
        };
    },
    shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
        return nextProps.unit.unitAvailableSpaces !== this.props.unit.unitAvailableSpaces;
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        if (this.props.unit.unitAvailableSpaces > 0 && !nextProps.unit.unitAvailableSpaces) {
            this.setState({
                hidden: false,
                recentlyTaken: true
            });
        }
    },
    render: function render() {
        var recentlyTakenClass = this.state.recentlyTaken ? ' booked ' : '';

        if (this.state.hidden) {
            return React.createElement('tr', null);
        }

        return React.createElement(
            'tr',
            { className: recentlyTakenClass },
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
                this.props.unit.id
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
React.render(React.createElement(Housing, null), document.getElementById('housing_table'));

},{}]},{},[1]);

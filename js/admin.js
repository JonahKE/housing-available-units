(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

jQuery.ajaxSetup({ cache: false });

var updateInterval = 5;

var Housing = React.createClass({
    displayName: 'Housing',

    getInitialState: function getInitialState() {
        var _state = {
            isDataPending: false,
            dataPending: null,
            dataCreateTimestamp: new Date().toString(),
            synclock: _bootstrap.synclock,
            synclog: _bootstrap.synclog,
            updating: false,
            clearingLock: false
        };
        return _state;
    },
    componentDidMount: function componentDidMount() {
        setTimeout(this.updateData, updateInterval * 1000);
    },
    updateData: function updateData() {
        this.setState({ updating: true });

        jQuery.getJSON(hau_admin_opts.admin_json, (function (r) {
            var now = new Date();
            if (r.hasOwnProperty('synclock')) {
                this.setState({
                    lastDownloadTime: new Date().toString(),
                    synclock: r.synclock,
                    synclog: r.synclog,
                    updating: false,
                    clearingLock: r.synclock && this.state.clearingLock
                });
            }
        }).bind(this)).always((function () {
            setTimeout(this.updateData, updateInterval * 1000);
        }).bind(this));
    },
    handleSyncClick: function handleSyncClick(e) {
        e.preventDefault();
        var action_url;

        switch (e.target.id) {
            case 'sync_all':
                this.setState({ synclock: true });
                action_url = hau_admin_opts.sync_all_url;
                break;
            case 'sync_bookings':
                this.setState({ synclock: true });
                action_url = hau_admin_opts.sync_bookings_url;
                break;
            case 'clear_lock':
                this.setState({ clearingLock: true });
                action_url = hau_admin_opts.sync_cancel_url;
                break;
            default:
                return false;
        }

        jQuery.ajax({
            url: action_url
        }).always((function () {
            this.updateData();
        }).bind(this));

        return false;
    },
    renderSyncLog: function renderSyncLog(s, i, a) {
        return React.createElement(SyncLog, { group: s, key: i, id: i });
    },
    render: function render() {
        var _this = this;

        return React.createElement(
            'div',
            { className: 'housing-admin-main' },
            React.createElement(CurrentAsOf, { lastUpdated: this.state.dataCreateTimestamp, updating: this.state.updating }),
            React.createElement(
                'table',
                { id: 'sync_log', className: 'wp-list-table widefat fixed posts' },
                React.createElement(
                    'thead',
                    null,
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            { className: 'column-date' },
                            'Status'
                        ),
                        React.createElement(
                            'th',
                            { className: 'column-date' },
                            'Start Time'
                        ),
                        React.createElement(
                            'th',
                            { className: 'column-title' },
                            'Log Messages'
                        )
                    )
                ),
                React.createElement(
                    'tbody',
                    null,
                    this.state.synclog.map(function (s, i, a) {
                        return _this.renderSyncLog(s, i, a);
                    })
                ),
                React.createElement(
                    'tfoot',
                    null,
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            null,
                            'Status'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Start Time'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Log Messages'
                        )
                    )
                )
            ),
            React.createElement('br', null),
            React.createElement(SyncButton, { synclock: this.state.synclock, clearingLock: this.state.clearingLock, clickSyncAction: this.handleSyncClick })
        );
    }
});

var CurrentAsOf = React.createClass({
    displayName: 'CurrentAsOf',

    render: function render() {
        var displaySpinner = this.props.updating ? 'block' : 'none';
        return React.createElement(
            'div',
            { className: 'last-updated-container' },
            React.createElement(
                'span',
                { className: 'last-updated' },
                'Last updated ',
                React.createElement(
                    'span',
                    { className: 'time', 'data-timestamp': this.props.lastUpdated },
                    this.props.lastUpdated
                )
            ),
            React.createElement('span', { id: 'spinner', className: 'spinner active', style: { display: displaySpinner } })
        );
    }
});

var SyncLog = React.createClass({
    displayName: 'SyncLog',

    renderLogMsg: function renderLogMsg(s, i, a) {
        return React.createElement(LogMsg, { item: s, key: i });
    },
    render: function render() {
        var _this2 = this;

        var g = this.props.group;
        var start_time = moment(g.start_time, 'X').format('YYYY-MM-DD hh:mm:ss a');
        var alt_class = this.props.id % 2 === 0 ? 'alternate' : '';
        var status = 'Unknown';
        var flag;

        switch (this.props.group.status) {
            case 1:
                flag = React.createElement('span', { className: 'dashicons dashicons-yes' });
                status = 'Success';
                break;
            case 2:
                flag = React.createElement('span', { className: 'dashicons dashicons-no' });
                status = 'Failed';
                break;
            case 3:
                flag = React.createElement('span', { className: 'spinner active', style: { display: 'block' } });
                status = 'Running';
                break;
        }

        return React.createElement(
            'tr',
            { className: alt_class },
            React.createElement(
                'td',
                { className: 'column-date' },
                flag,
                ' ',
                status
            ),
            React.createElement(
                'td',
                { className: 'column-title' },
                start_time
            ),
            React.createElement(
                'td',
                { className: 'column-message' },
                React.createElement(
                    'div',
                    { className: 'message' },
                    g.log.map(function (s, i, a) {
                        return _this2.renderLogMsg(s, i, a);
                    })
                )
            )
        );
    }
});

var SyncButton = React.createClass({
    displayName: 'SyncButton',

    render: function render() {
        var g = this.props.group;
        var syncStatusLabel = 'Syncing';
        var sync_class = this.props.synclock ? 'sync' : '';
        var clearLockDisplay = 'inline';

        if (this.props.clearingLock) {
            syncStatusLabel = 'Clearing lock';
            clearLockDisplay = 'none';
        }

        return React.createElement(
            'div',
            { className: 'tablenav bottom' },
            React.createElement(
                'div',
                { className: 'alignleft actions bulkactions' },
                React.createElement(
                    'div',
                    { id: 'sync_button', className: sync_class },
                    React.createElement(
                        'a',
                        { id: 'sync_all', href: '#', className: 'button', onClick: this.props.clickSyncAction },
                        'Sync All'
                    ),
                    React.createElement(
                        'a',
                        { id: 'sync_bookings', href: '#', className: 'button', onClick: this.props.clickSyncAction },
                        'Sync Bookings'
                    )
                ),
                React.createElement(
                    'div',
                    { id: 'sync_status', className: sync_class },
                    React.createElement('span', { className: 'spinner active', style: { display: 'inline-block', 'float': 'none' } }),
                    ' ',
                    syncStatusLabel,
                    '...',
                    React.createElement(
                        'a',
                        { id: 'clear_lock', href: '#', onClick: this.props.clickSyncAction, style: { display: clearLockDisplay } },
                        'Clear lock'
                    )
                )
            )
        );
    }
});

var LogMsg = React.createClass({
    displayName: 'LogMsg',

    render: function render() {
        var l = this.props.item;
        var time_formatted = moment(l.time, 'X').format('hh:mm:ss a');

        return React.createElement(
            'div',
            null,
            React.createElement(
                'span',
                null,
                time_formatted,
                ' - ',
                l.msg
            ),
            React.createElement('br', null)
        );
    }
});

ReactDOM.render(React.createElement(Housing, null), document.getElementById('housing_table'));

},{}]},{},[1]);

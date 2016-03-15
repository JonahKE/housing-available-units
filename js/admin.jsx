jQuery.ajaxSetup({ cache: false });

var updateInterval = 5;

var Housing = React.createClass({
    getInitialState: function() {
        var _state = {
            isDataPending       : false,
            dataPending         : null,
            dataCreateTimestamp : (new Date()).toString(),
            synclock            : _bootstrap.synclock,
            synclog             : _bootstrap.synclog,
            updating            : false,
            clearingLock        : false
        };
        return _state;
    },
    componentDidMount:function(){
        setTimeout( this.updateData, updateInterval * 1000);
    },
    updateData: function(){
        this.setState({updating: true});

        jQuery.getJSON( hau_admin_opts.admin_json, function(r){
            var now = new Date();
            if ( r.hasOwnProperty( 'synclock' ) ){
                this.setState({
                    lastDownloadTime : (new Date()).toString(),
                    synclock         : r.synclock,
                    synclog          : r.synclog,
                    updating         : false,
                    clearingLock     : ( r.synclock && this.state.clearingLock )
                });
            }
        }.bind(this)).always(function(){
            setTimeout( this.updateData, updateInterval * 1000 );
        }.bind(this));
    },
    handleSyncClick: function( e ){
        e.preventDefault();
        var action_url;

        switch ( e.target.id ){
            case 'sync_all':
                this.setState({synclock: true});
                action_url = hau_admin_opts.sync_all_url;
                break;
            case 'sync_bookings':
                this.setState({synclock: true});
                action_url = hau_admin_opts.sync_bookings_url;
                break;
            case 'clear_lock':
                this.setState({clearingLock: true});
                action_url = hau_admin_opts.sync_cancel_url;
                break;
            default:
                return false;
        }

        jQuery.ajax({
            url: action_url
        }).always(function() {
            this.updateData();
        }.bind(this));
        return false;
    },
    renderSyncLog: function(s,i,a) {
        return <SyncLog group={s} key={i} id={i} />;
    },
    render: function(){
        return (
            <div className="housing-admin-main">
                <CurrentAsOf lastUpdated={this.state.dataCreateTimestamp} updating={this.state.updating} />
                <table id="sync_log" className="wp-list-table widefat fixed posts">
                    <thead>
                        <tr>
                            <th className="column-date">Status</th>
                            <th className="column-date">Start Time</th>
                            <th className="column-title">Log Messages</th>
                        </tr>
                    </thead>
                    <tbody>
                    { this.state.synclog.map( (s,i,a) => this.renderSyncLog(s,i,a) ) }
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>Status</th>
                            <th>Start Time</th>
                            <th>Log Messages</th>
                        </tr>
                    </tfoot>
                </table>
                <br />
                <SyncButton synclock={this.state.synclock} clearingLock={this.state.clearingLock} clickSyncAction={this.handleSyncClick} />
            </div>
        );
    }
});

var CurrentAsOf = React.createClass({
    render: function(){
        var displaySpinner = this.props.updating ? 'block' : 'none';
        return (
                <div className='last-updated-container'>
                    <span className="last-updated">Last updated <span className="time" data-timestamp={this.props.lastUpdated}>{this.props.lastUpdated}</span></span>
                    <span id="spinner" className="spinner active" style={{display : displaySpinner}}></span>
                </div>
            );
    }
});

var SyncLog = React.createClass({
    renderLogMsg: function(s,i,a) {
        return <LogMsg item={s} key={i} />;
    },
    render: function() {
        var g          = this.props.group;
        var start_time = moment(g.start_time, 'X').format('YYYY-MM-DD hh:mm:ss a');
        var alt_class  = this.props.id % 2 === 0 ? 'alternate' : '';
        var status     = 'Unknown';
        var flag;

        switch (this.props.group.status) {
            case 1:
                flag = <span className="dashicons dashicons-yes"></span>;
                status = 'Success';
                break;
            case 2:
                flag = <span className="dashicons dashicons-no"></span>;
                status = 'Failed';
                break;
            case 3:
                flag = <span className="spinner active" style={{display: 'block'}}></span>;
                status = 'Running';
                break;
        }

        return (
            <tr className={alt_class}>
                <td className="column-date">{flag} {status}</td>
                <td className="column-title">{start_time}</td>
                <td className="column-message">
                    <div className="message">{ g.log.map( (s,i,a) => this.renderLogMsg(s,i,a) ) }</div>
                </td>
            </tr>
        );
    }
});

var SyncButton = React.createClass({
    render: function() {
        var g                   = this.props.group;
        var syncStatusLabel     = 'Syncing';
        var sync_class          = this.props.synclock ? 'sync' : '';
        var clearLockDisplay    = 'inline';

        if( this.props.clearingLock ){
            syncStatusLabel     = 'Clearing lock';
            clearLockDisplay    = 'none';
        }

        return (
            <div className="tablenav bottom">
                <div className="alignleft actions bulkactions">
                    <div id="sync_button" className={sync_class}>
                        <a id="sync_all" href="#" className="button" onClick={this.props.clickSyncAction}>
                            Sync All
                        </a>
                        <a id="sync_bookings" href="#" className="button" onClick={this.props.clickSyncAction}>
                            Sync Bookings
                        </a>
                    </div>
                    <div id="sync_status" className={sync_class}>
                        <span className="spinner active" style={{display:'inline-block','float':'none'}}></span> {syncStatusLabel}... 
                        <a id="clear_lock" href="#" onClick={this.props.clickSyncAction} style={{display:clearLockDisplay}}>Clear lock</a>
                    </div>
                </div>
            </div>
        );
    }
});

var LogMsg = React.createClass({
    render: function() {
        var l              = this.props.item;
        var time_formatted = moment( l.time, 'X' ).format('hh:mm:ss a');

        return (
            <div>
                <span>{time_formatted} - {l.msg}</span><br />
            </div>
        );
    }
});

ReactDOM.render( <Housing />, document.getElementById('housing_table') );

<?php

class BU_HAU_Admin
{

	// constants
	const PREFIX    = 'bu_hau_';
	static $debug   = false;

	/**
	 * Setup admin menu, ajax update hook
	 * @return null
	 */
	static function init( $debug = false ) {

		self::$debug = $debug;

		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ) );
		add_action( 'wp_ajax_bu_hau_sync_log', array( __CLASS__, 'ajax_sync_log' ) );

	}

	/**
	 * Get Sync Log
	 * @return array
	 */
	static function get_sync_log() {

		return get_option( 'bu_hau_sync_log', array() );
	}

	/**
	 * Output sync log
	 * @return string JSON-encoded consumable output
	 */
	static function ajax_sync_log() {

		// headers
		if ( isset( $_GET['bu_hau_bootstrap'] ) ) {
			echo 'var _bootstrap = ';
			header( 'Content-Type: text/javascript' );
		} else {
			header( 'Content-Type: application/json' );
		}

		$sync_log_items = array_slice( self::get_sync_log(), 0, 5 );
		$is_locked      = BU_HAU_Sync_Lock::get_instance()->is_locked();
		$response = array(
			'synclog'  => $sync_log_items,
			'synclock' => $is_locked,
		);

		echo json_encode( $response );
		die;
	}

	/**
	 * Add a Settings item to view Sync Log
	 * @return [type] [description]
	 */
	static function admin_menu() {

		$perm = 'bu_edit_options';
		$page = add_options_page(
			'Housing Available Units',
			'Housing Available Units',
			$perm,
			'bu_hau_admin',
			array( __CLASS__, 'admin_page' )
		);

		add_action( 'admin_head-'. $page, array( __CLASS__, 'admin_assets' ) );
	}

	/**
	 * Add the necessary assets (css, js)
	 * @return null
	 */
	static function admin_assets() {

		wp_register_script( 'momentjs', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.3/moment.min.js', array(), '2.10.3' );

		if ( self::$debug ) {
			wp_register_script( 'react', 'https://fb.me/react-with-addons-0.14.6.js', array(), '0.14.6' );
			wp_register_script( 'react-dom', 'https://fb.me/react-dom-0.14.6.js', array( 'react', 'babel' ), '0.14.6' );
			wp_enqueue_script( 'babel', 'https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.34/browser.js', array(), null );
			wp_register_script( 'hau-react-app',  plugins_url( '../js/admin.jsx', __FILE__ ), array( 'jquery', 'react-dom', 'momentjs', 'hau-admin-js' ), BU_HAU_VERSION, true );
		} else {
			wp_register_script( 'react', 'https://fb.me/react-0.14.6.min.js', array(), '0.14.6' );
			wp_register_script( 'react-dom', 'https://fb.me/react-dom-0.14.6.min.js', array( 'react' ), '0.14.6' );
			wp_register_script( 'hau-react-app',  plugins_url( '../js/admin.js', __FILE__ ), array( 'jquery', 'react-dom', 'momentjs', 'hau-admin-js' ), BU_HAU_VERSION, true );
		}

		wp_enqueue_script( 'hau-react-app' );
		wp_enqueue_style( 'hau-admin-css', plugins_url( '../css/admin.css', __FILE__ ), array(), BU_HAU_VERSION );

		// feed data onload
		$admin_js_url = admin_url( 'admin-ajax.php?action=bu_hau_sync_log' );
		wp_enqueue_script( 'hau-admin-js', $admin_js_url . '&bu_hau_bootstrap=1', array(), time() );

		// for AJAX calls
		$sync_all_url      = admin_url( 'admin-ajax.php?action=bu_hau_sync_all' );
		$sync_bookings_url = admin_url( 'admin-ajax.php?action=bu_hau_sync_bookings' );
		$sync_cancel_url   = admin_url( 'admin-ajax.php?action=bu_hau_sync_cancel' );
		wp_localize_script(
			'hau-react-app', 'hau_admin_opts', array(
			'admin_json'        => $admin_js_url,
			'sync_all_url'      => $sync_all_url,
			'sync_bookings_url' => $sync_bookings_url,
			'sync_cancel_url'   => $sync_cancel_url,
			)
		);
	}

	/**
	 * Template
	 * @return null
	 */
	static function admin_page() {

		include __DIR__ . '/../interface/admin.php';
	}
}

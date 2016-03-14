<?php
/*
Plugin Name: Housing Available Units
Plugin URI: http://www.bu.edu/tech
Author: Boston University (IS&T)
Description: Processes StarRez data periodically to produce a json output file for frontend users consumption.
Version: 0.1
Text Domain: housing-available-units
*/

define( 'BU_HAU_VERSION', '0.1' );
define( 'BU_HAU_MEDIA_DIR', '/housing-available-units/' );
define( 'BU_HAU_MEDIA_UNITS_JSON_FILE', BU_HAU_MEDIA_DIR . 'units.json' );
define( 'BU_HAU_MEDIA_UNITS_JS_FILE', BU_HAU_MEDIA_DIR . 'units.js' );

define( 'BU_HAU_SAMPLE_DIR', __DIR__ . '/sample/' );
define( 'BU_HAU_FILE_EXT', '.csv' );
define( 'BU_HAU_SPACE_FILENAME', 'Space File' );
define( 'BU_HAU_BOOKINGS_FILENAME', 'Bookings' );
define( 'BU_HAU_HOUSING_CODES_FILENAME', 'Specialty Housing Codes' );

require_once( 'includes/class-lock.php' );
require_once( 'includes/class-sync.php' );
require_once( 'includes/class-admin.php' );

// define( 'BU_HAU_DEBUG', true );
// define( 'BU_HAU_USE_SAMPLE_BOOKINGS', true );

add_action( 'init', array( 'Housing_Available_Units', 'init' ), 99);
add_shortcode( 'housing_availability', array( 'Housing_Available_Units', 'do_shortcode' ) );

register_activation_hook( __FILE__, array( 'Housing_Available_units', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'Housing_Available_units', 'deactivate' ) );

// start debug
function setup_jsx_tags( $tag, $handle, $src ) {
	if( defined( 'BU_HAU_DEBUG' ) && BU_HAU_DEBUG ){
		if ( 'hau-react-app' == $handle ) {
			$tag = str_replace( "<script type='text/javascript'", "<script type='text/babel'", $tag );
		}
	}
	return $tag;
}
add_filter( 'script_loader_tag', 'setup_jsx_tags', 10, 3 );
// end debug

class Housing_Available_Units {

	// internal
	public static $debug = false;

	/**
	 * Setup
	 * @return null
	 */
	static function init() {

		if ( defined( 'BU_HAU_DEBUG' ) && BU_HAU_DEBUG ) {
			self::$debug = true;
		}

		BU_HAU_Sync::init( self::$debug );

		if ( is_admin() ) {
			BU_HAU_Admin::init( self::$debug );
		}
	}

	/**
	 * Handle shortcode [housing_availability]
	 * @return string containing React app
	 */
	static function do_shortcode( $atts, $content = '' ) {

		wp_register_script( 'bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js', array(), '3.3.6' );
		wp_register_script( 'momentjs', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.3/moment.min.js', array(), '2.10.3' );
		wp_register_script( 'sticky-table-headers',  plugins_url( 'js/vendor/jquery.stickytableheaders.min.js', __FILE__ ), array( 'jquery' ), '0.1.19' );

		$wp_upload_dir  = wp_upload_dir();
		$units_json_url = $wp_upload_dir['baseurl'] . BU_HAU_MEDIA_UNITS_JSON_FILE;
		$units_js_url   = $wp_upload_dir['baseurl'] . BU_HAU_MEDIA_UNITS_JS_FILE;

		if ( file_exists( $wp_upload_dir['basedir'] . BU_HAU_MEDIA_UNITS_JS_FILE ) ) {
			$sync_timestamp = filemtime( $wp_upload_dir['basedir'] . BU_HAU_MEDIA_UNITS_JS_FILE );
			wp_enqueue_script( 'hau-units-js', $units_js_url, array(), $sync_timestamp );
		}

		if( self::$debug ){
			wp_register_script( 'react', 'https://fb.me/react-with-addons-0.14.6.js', array(), '0.14.6' );
			wp_register_script( 'react-dom', 'https://fb.me/react-dom-0.14.6.js', array('react','babel'), '0.14.6' );
			wp_enqueue_script( 'babel', 'https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.34/browser.js', array(), null );
			wp_register_script( 'hau-react-app',  plugins_url( 'js/app.jsx', __FILE__ ), array( 'jquery', 'bootstrap', 'react-dom', 'momentjs', 'sticky-table-headers', 'hau-units-js' ), BU_HAU_VERSION, true );
		} else {
			wp_register_script( 'react', 'https://fb.me/react-0.14.6.min.js', array(), '0.14.6' );
			wp_register_script( 'react-dom', 'https://fb.me/react-dom-0.14.6.min.js', array('react'), '0.14.6' );
			wp_register_script( 'hau-react-app',  plugins_url( 'js/app.js', __FILE__ ), array( 'jquery', 'bootstrap', 'react-dom', 'momentjs', 'sticky-table-headers', 'hau-units-js' ), BU_HAU_VERSION, true );
		}

		wp_localize_script( 'hau-react-app', 'hau_opts', array(
				'ajaxurl'           => admin_url( 'admin-ajax.php' ),
				'is_user_logged_in' => is_user_logged_in(),
				'units_json'        => $units_json_url,
			) );
		wp_enqueue_script( 'hau-react-app' );
		wp_register_style( 'bootstrap-css', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css', array(), '3.3.6' );
		wp_register_style( 'bootstrap-theme-css',  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css', array('bootstrap-css'), '3.3.6' );
		wp_enqueue_style( 'hau-css', plugins_url( 'css/hau.css', __FILE__ ) , array('bootstrap-theme-css'), BU_HAU_VERSION );

		ob_start();
		require 'template-shortcode.php';
		return ob_get_clean();
	}

	/**
	 * On plugin activate, setup sync cron jobs
	 * @return null
	 */
	static function activate() {
		BU_HAU_Sync::setup_cron();
		BU_HAU_Sync::setup_sync();
		// BU_HAU_Sync::sync(); // disabling sync on activate since it takes too long within a page request
	}

	/**
	 * On plugin deactivate, clear sync cron jobs
	 * @return null
	 */
	static function deactivate() {
		BU_HAU_Sync::clear_sync();
	}

}

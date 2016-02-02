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
define( 'BU_HAU_SAMPLE_SPACE_FILE', 'Space File.csv' );
define( 'BU_HAU_SAMPLE_BOOKINGS_FILE', 'Bookings.csv' );
define( 'BU_HAU_SAMPLE_HOUSING_CODES_FILE', 'Specialty Housing Codes.csv' );

// define( 'BU_HAU_DEBUG', true );

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

	// constants
	const PREFIX    = 'bu_hau_';
	const SPACES_SYNC_NAME = 'sync_all';
	const SPACES_SYNC_TIME = '3 am';
	const SPACES_SYNC_FREQ = 'daily';
	const BOOKINGS_SYNC_NAME = 'sync_bookings';
	const BOOKINGS_SYNC_FREQ = 'quarterhour';
	// regex
	const GET_LAST_HSV  = '/-.*/';
	const GET_FIRST_HSV = '/.*-/';

	public static $debug = false;

	// output
	public static $sync_start_time = null;
	public static $output          = array();
	public static $areas           = array();

	// counts
	public static $space_types_counts   = array();
	public static $housing_codes_counts = array();
	public static $gender_counts        = array();
	public static $room_size_counts     = array();

	// import
	private static $spaces        = array();
	private static $bookings      = array();
	private static $housing_codes = array();


	/**
	 * Setup
	 * @return null
	 */
	static function init() {

		if ( defined( 'BU_HAU_DEBUG' ) && BU_HAU_DEBUG ) {
			self::$debug = true;
		}

		self::setup_cron();

		if ( isset( $_GET['hau_sync'] ) ) {
			echo self::sync_all();
			die;
		}

		if ( isset( $_GET['hau_bookings_sync'] ) ) {
			echo self::sync_bookings();
			die;
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

		$units_data = null;
		if ( file_exists( $wp_upload_dir['basedir'] . BU_HAU_MEDIA_UNITS_JSON_FILE ) ) {
			$units_data = json_decode( file_get_contents( $wp_upload_dir['basedir'] . BU_HAU_MEDIA_UNITS_JSON_FILE ) );
		}

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
				// '_bootstrap'        => $units_data,
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
	 * On plugin activate, sync everything and setup sync cron jobs
	 * @return null
	 */
	static function activate() {
		self::setup_cron();
		self::setup_sync();
		self::sync_all();
	}

	/**
	 * On plugin deactivate, remove sync cron jobs
	 * @return null
	 */
	static function deactivate() {
		wp_clear_scheduled_hook( self::PREFIX . self::SPACES_SYNC_NAME );
		wp_clear_scheduled_hook( self::PREFIX . self::BOOKINGS_SYNC_NAME );
	}

	/**
	 * Setup sync jobs
	 * @return null
	 */
	static function setup_sync() {
		if ( ! wp_next_scheduled( self::PREFIX . self::SPACES_SYNC_NAME ) ) {
			wp_schedule_event( strtotime( self::SPACES_SYNC_TIME ), self::SPACES_SYNC_FREQ, self::PREFIX . self::SPACES_SYNC_NAME );
		}
		if ( ! wp_next_scheduled( self::PREFIX . self::BOOKINGS_SYNC_NAME ) ) {
			wp_schedule_event( time(), self::BOOKINGS_SYNC_FREQ, self::PREFIX . self::BOOKINGS_SYNC_NAME );
		}
	}

	/**
	 * Setup cron
	 * - Adds quarterhour recurrence type
	 * - Adds hooks to fire when sync happens
	 * @return null
	 */
	static function setup_cron() {
		add_filter( 'cron_schedules', array( __CLASS__, 'cron_add_quarter_hour' ) );
		add_action( self::PREFIX . self::BOOKINGS_SYNC_NAME, array( __CLASS__, self::BOOKINGS_SYNC_NAME ) );
		add_action( self::PREFIX . self::SPACES_SYNC_NAME, array( __CLASS__, self::SPACES_SYNC_NAME ) );
	}

	/**
	 * Allow us to be able to register WP cron to run every 15 minutes
	 * @param  array $schedules current
	 * @return array            modified
	 */
	static function cron_add_quarter_hour( $schedules ) {
	    $schedules['quarterhour'] = array(
	        'interval' => 900,
	        'display' => __( 'Every Quarter Hour (15 minutes)' )
	    );
	    return $schedules;
	}

	/**
	 * Sync the spaces, bookings, and housing codes
	 * Uses sample files when in Debug mode
	 * @return string output as written to media dir file
	 */
	static function sync_all() {
		if ( defined( 'BU_FS_READ_ONLY' ) && BU_FS_READ_ONLY ) return;

		self::$sync_start_time = current_time( 'mysql' );

		if ( self::$debug ) {
			$space_file = BU_HAU_SAMPLE_DIR . BU_HAU_SAMPLE_SPACE_FILE;
			$bookings_file = BU_HAU_SAMPLE_DIR . BU_HAU_SAMPLE_BOOKINGS_FILE;
			$housing_codes_file = BU_HAU_SAMPLE_DIR . BU_HAU_SAMPLE_HOUSING_CODES_FILE;
		} else {
			// @todo: download remote file to media dir
		}

		self::parse( $space_file, $bookings_file, $housing_codes_file );
		self::process();
		self::apply_bookings();
		self::cleanup();
		self::prepare_output();
		self::write();
		return json_encode( self::$output );
	}

	/**
	 * Syncs bookings on top of the saved units json file in WP Media Dir
	 * @return null
	 */
	static function sync_bookings() {
		if ( defined( 'BU_FS_READ_ONLY' ) && BU_FS_READ_ONLY ) return;

		self::$sync_start_time = current_time( 'mysql' );

		$wp_upload_dir = wp_upload_dir();
		$units_file = $wp_upload_dir['basedir'] . BU_HAU_MEDIA_UNITS_JSON_FILE;

		if ( self::$debug ) {
			$bookings_file = BU_HAU_SAMPLE_DIR . BU_HAU_SAMPLE_BOOKINGS_FILE;
		} else {
			// @todo: download remote file to media dir
		}

		self::load( $units_file, $bookings_file );
		self::apply_bookings();
		self::prepare_output();
		// self::write();
		return json_encode( self::$output );
	}

	/**
	 * Load space file and bookings file into static variables
	 * @param  string $units_file    JSON file
	 * @param  string $bookings_file CSV file
	 * @return null
	 */
	static function load( $units_file, $bookings_file ) {

		// spaces
		$output_json = file_get_contents( $units_file );
		self::$output = json_decode( $output_json, true );
		self::$areas = self::$output['areas'];
		self::$space_types_counts = self::$output['spaceTypes'];

		// bookings
		$bookings_data = file_get_contents( $bookings_file );
		self::parse_bookings( $bookings_file );


	}

	/**
	 * Parses the CSV parameter files into the static class vars for output.
	 *
	 * @param  string $space_file         CSV file
	 * @param  string $bookings_file      CSV file
	 * @param  string $housing_codes_file CSV file
	 * @return true                       when successful
	 */
	static function parse( $space_file, $bookings_file = '', $housing_codes_file = '' ) {
		self::parse_spaces( $space_file );
		self::parse_bookings( $bookings_file );
		self::parse_housing_codes( $housing_codes_file );
		return true;
	}

	/**
	 * Parses the Spaces CSV file into format:
	 * [{ 'Room': 'something', 'Type': 'else' }, ... ]
	 * @uses self::$spaces adds parsed spaces
	 * @param  string $space_file         CSV file
	 * @return null
	 */
	static function parse_spaces( $space_file ) {
		if ( file_exists( $space_file ) ) {
			if ( FALSE !== ( $handle = fopen( $space_file , 'r' ) ) ) {
				$headers = fgetcsv( $handle, 0, ',' );
				$headers = array_map( 'trim', $headers );
				while ( ( $data = fgetcsv( $handle, 0, ',' ) ) !== FALSE ) {
					$data = array_map( 'trim', $data );
					// format: { 'Room': 'something', 'Type': 'else' }
					$space = array();
					for ( $c = 0; $c < count( $data ); $c++ ) {
						$space[$headers[$c]] = $data[$c];
					}
					self::$spaces[] = $space;
				}
				fclose($handle);
			}
		}
	}

	/**
	 * Parses the Bookings CSV file into format:
	 * [ 1, 2 ... 999 ]
	 * @uses self::$bookings adds parsed bookings
	 * @param  string $bookings_file CSV file
	 * @return null
	 */
	static function parse_bookings( $bookings_file ) {
		if ( file_exists( $bookings_file ) ) {
			if ( FALSE !== ( $handle = fopen( $bookings_file , 'r' ) ) ) {
				while ( ( $data = fgetcsv( $handle, 0, ',' ) ) !== FALSE ) {
					$data = array_map( 'trim', $data );
					// format: [ 1, 2 ... 999 ]
					self::$bookings[] = $data[0];
				}
				fclose($handle);
			}
		}
	}

	/**
	 * Parses the Housing Codes CSV file into format:
	 * [
	 * 	CODE => Code Name,
	 * 	CODE2 => Code Name 2,
	 * 	...
	 * ]
	 * @uses self::$housing_codes adds parsed housing codes and descriptions
	 * @param  string $housing_codes_file CSV file
	 * @return null
	 */
	static function parse_housing_codes( $housing_codes_file ) {
		if ( file_exists( $housing_codes_file ) ) {
			if ( FALSE !== ( $handle = fopen( $housing_codes_file , 'r' ) ) ) {
				$headers = fgetcsv( $handle, 0, ',' );
				while ( ( $data = fgetcsv( $handle, 0, ',' ) ) !== FALSE ) {
					$data = array_map( 'trim', $data );

					if ( $data[2] == 'True' ) {
						// ensure the code is active
						// format: CODE => Code Name
						self::$housing_codes[$data[0]] = $data[1];
					}
				}
				fclose($handle);
			}
		}
	}

	/**
	 * Process the areas data into structured React-consumable data
	 * @return null
	 */
	static function process() {

		if ( self::$debug && isset( $_GET['hau_limit'] ) ) {
			array_splice( self::$spaces, intval( $_GET['hau_limit'] ) );
		}

		self::$areas = array();
		foreach ( self::$spaces as $space ) {

			// $space_booked = in_array( $space['Space ID'], $data['bookings'] ) ? true : false;

			// areas
			$area_id = $space['Room Location Area'];
			if ( ! isset( self::$areas[$area_id] ) ) {
				self::$areas[$area_id] = array(
					'areaID'                => $area_id,
					'buildings'             => array(),
					'roomCount'             => 0,
					'availableSpaceCount'   => 0,
					'totalSpaceCount'       => 0,
					'spacesAvailableByType' => array(
						'Apt'    => 0,
						'Suite'  => 0,
						'Dorm'   => 0,
						'Semi'   => 0,
						'Studio' => 0,
					),
				);
			}

			self::$areas[$area_id]['totalSpaceCount']++;
			// if ( ! $space_booked ) self::$areas[$area_id]['availableSpaceCount']++;

			$summary_room_type = preg_replace( self::GET_LAST_HSV, '', $space['Room Type'] );
			self::$areas[$area_id]['spacesAvailableByType'][$summary_room_type]++;

			// counts
			if ( ! isset( self::$space_types_counts[$summary_room_type] ) ) {
				self::$space_types_counts[$summary_room_type] = 0;
			}

			if ( ! isset( self::$gender_counts[$space['Gender']] ) ) {
				self::$gender_counts[$space['Gender']] = 0;
			}

			if ( ! in_array( $space['Room Location'], self::$areas[$area_id]['buildings'] ) ) {
				self::$areas[$area_id]['buildings'][] = $space['Room Location'];
			}

			// units
			$unit_id = $space['Room Location Floor Suite'];
			if ( ! isset( self::$areas[$area_id]['units'][$unit_id] ) ) {

				$specialty = self::get_specialty_code( $space['Specialty Cd'] );
				if ( $specialty ) {
					self::$housing_codes_counts[$specialty] = 0;
				}

				self::$areas[$area_id]['units'][$unit_id] = array(
					'unitID'              => $unit_id,
					'location'            => $space['Room Location'],
					'floor'               => preg_replace( self::GET_FIRST_HSV, '', $space['Room Location Section'] ),
					'suite'               => str_replace( $space['Room Location Section'], '', $unit_id ),
					'unitTotalSpaces'     => 0,
					'unitAvailableSpaces' => 0,
					'gender'              => $space['Gender'],
					'specialty'           => $specialty,
					'webImageLocation'    => $space['Web Image Location'],
				);

			}

			self::$areas[$area_id]['units'][$unit_id]['unitTotalSpaces']++;
			// if ( ! $space_booked ) self::$areas[$area_id]['units'][$unit_id]['unitAvailableSpaces']++;

			// rooms
			$room = $space['Room Base'];
			if ( isset( self::$areas[$area_id]['units'][$unit_id]['rooms'][$room] ) ) {
				self::$areas[$area_id]['units'][$unit_id]['rooms'][$room]['spaceIDs'][] = $space['Space ID'];
			} else {
				// new room
				$room_size = self::get_room_size( $space['Room Type'] );

				self::$areas[$area_id]['roomCount']++;
				self::$areas[$area_id]['units'][$unit_id]['rooms'][$room] = array(
					'roomID'              => $room,
					'summaryRoomType'     => $summary_room_type,
					'roomType'            => $space['Room Type'],
					'roomSize'            => $room_size,
					'room'                => preg_replace( self::GET_FIRST_HSV, '', $room),
					'roomTotalSpaces'     => 0,
					'roomAvailableSpaces' => 0,
					'spaceIDs'            => array( $space['Space ID'] ),
				);

				if ( ! isset( self::$room_size_counts[$room_size] ) ) {
					self::$room_size_counts[$room_size] = 0;
				}
			}

			self::$areas[$area_id]['units'][$unit_id]['rooms'][$room]['roomTotalSpaces']++;
			// if ( ! $space_booked ) self::$areas[$area_id]['units'][$unit_id]['rooms'][$room]['roomAvailableSpaces']++;

		}
		return true;
	}

	/**
	 * Apply bookings data to areas
	 * @return null
	 */
	static function apply_bookings() {
		// reset counts
		$counts_arrays = array( 'space_types_counts', 'gender_counts', 'room_size_counts', 'housing_codes_counts' );
		foreach ( $counts_arrays as $counters ) {
			foreach ( self::$$counters as &$counter ) {
				$counter = 0;
			}
		}

		foreach ( self::$areas as &$area ) {
			$area['availableSpaceCount'] = $area['totalSpaceCount'];
			foreach ( $area['units'] as &$unit ) {
				$unit['unitAvailableSpaces'] = $unit['unitTotalSpaces'];
				foreach ( $unit['rooms'] as &$room ) {
					$room['roomAvailableSpaces'] = $room['roomTotalSpaces'];
					foreach( $room['spaceIDs'] as $space_id ) {
						if ( in_array( $space_id, self::$bookings ) ) {
							// space is booked, update totals
							$area['availableSpaceCount']--;
							$area['spacesAvailableByType'][$room['summaryRoomType']]--;
							$unit['unitAvailableSpaces']--;
							$room['roomAvailableSpaces']--;

						} else {
							self::$space_types_counts[$room['summaryRoomType']]++;
							self::$gender_counts[$unit['gender']]++;
							self::$room_size_counts[$room['roomSize']]++;
							if ( ! empty( $unit['specialty'] ) && trim( $unit['specialty'] ) ) {
								self::$housing_codes_counts[$unit['specialty']]++;
							}
						}
					}
				}
				unset( $room );
			}
			unset( $unit );
		}
		unset( $area );
	}

	/**
	 * Returns a matching housing code with $code using self::$housing_codes
	 * @param  string $code 3-letter code
	 * @return string       definition if found
	 */
	static function get_specialty_code( $code ) {
		return ! empty( self::$housing_codes[$code] ) ? self::$housing_codes[$code] : '';
	}

	/**
	 * Room Types are weirdly stored. Sometimes they're at the end, except when:
	 * * There is a abbreviated 2 letter code at the end
	 * * Or when it ends with the words Paddle.
	 *
	 * @param  string $room_type format: Apt-4Person-Single
	 * @return string            Single
	 */
	static function get_room_size( $room_type ) {
		if ( preg_match( '!-([A-Za-z]*)-([A-Z]{2})!', $room_type, $matches ) ){
			$room_size = $matches[1] . '-' . $matches[2];
		} else if ( stripos( $room_type, '-Paddle' ) !== FALSE ) {
			$room_size = preg_replace( '/.*-([^-]+)-Paddle/', '\1-Paddle', $room_type );
		} else {
			$room_size = preg_replace( self::GET_FIRST_HSV, '', $room_type );
		}
		return $room_size;
	}

	/**
	 * Writes the output to a WP media dir (relative to BU_HAU_MEDIA_DIR) file
	 * @return null
	 */
	static function write() {
		$wp_upload_dir = wp_upload_dir();
		$units_json_file = $wp_upload_dir['basedir'] . BU_HAU_MEDIA_UNITS_JSON_FILE;
		$units_js_file = $wp_upload_dir['basedir'] . BU_HAU_MEDIA_UNITS_JS_FILE;

		self::write_contents( $units_json_file, json_encode( self::$output ) );
		self::write_contents( $units_js_file, 'var _bootstrap = ' . json_encode( self::$output ) );
	}

	static function write_contents( $file, $contents ) {
		$path = dirname( $file );

		if ( ! file_exists( $path ) ) {
			if ( ! wp_mkdir_p( $path ) ) {
				error_log( __METHOD__ . ': Failed to create dir for writing processed data: ' . $path );
				return false;
			}
		}

		$handle = fopen( $file, 'w+' );
		fwrite( $handle, $contents );
		fclose( $handle );
	}

	/**
	 * Cleans up the key/value pairs to be only value
	 * @return true
	 */
	static function cleanup() {
		self::$areas = array_values( self::$areas );

		foreach ( self::$areas as &$area ) {
			$area['units'] = array_values( $area['units'] );
			foreach ( $area['units'] as &$unit ) {
				$unit['rooms'] = array_values( $unit['rooms'] );
			}
		}
		return true;
	}

	/**
	 * Combines the final output from static class vars
	 * @return null
	 */
	static function prepare_output() {
		self::$output = array(
			'createTime'   => self::$sync_start_time,
			'spaceTypes'   => self::$space_types_counts,
			'housingCodes' => self::$housing_codes_counts,
			'gender'       => self::$gender_counts,
			'roomSize'     => self::$room_size_counts,
			'areas'        => self::$areas,
		);
	}
}
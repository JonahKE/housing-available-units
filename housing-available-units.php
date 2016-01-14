<?php
/*
Plugin Name: Housing Available Units
Plugin URI: http://www.bu.edu/tech
Author: Boston University (IS&T)
Description: Processes StarRez data periodically to produce a json output file for frontend users consumption.
Version: 0.1
Text Domain: housing-available-units
*/

define( 'BU_HAU_MEDIA_DIR', '/housing-available-units/' );
define( 'BU_HAU_MEDIA_UNITS_FILE', BU_HAU_MEDIA_DIR . 'units.json' );
define( 'BU_HAU_SAMPLE_DIR', __DIR__ . '/sample/' );
define( 'BU_HAU_SAMPLE_SPACE_FILE', 'Space File.csv' );
define( 'BU_HAU_SAMPLE_BOOKINGS_FILE', 'Bookings.csv' );
define( 'BU_HAU_SAMPLE_HOUSING_CODES_FILE', 'Specialty Housing Codes.csv' );

add_action( 'init', array( 'Housing_Available_Units', 'init' ), 99);

class Housing_Available_Units {

	// constants
	const PREFIX    = 'bu_hau_';
	const SPACES_SYNC_TIME = '3 am';
	const SPACES_SYNC_FREQ = 'daily';
	// regex
	const GET_LAST_HSV  = '/-.*/';
	const GET_FIRST_HSV = '/.*-/';

	public static $debug = false;

	// output
	public static $sync_start_time = null;
	public static $output          = array();
	public static $areas           = array();
	public static $space_types     = array();

	// import
	private static $spaces        = array();
	private static $bookings      = array();
	private static $housing_codes = array();


	/**
	 * Setup
	 * @return null
	 */
	static function init() {

		if ( defined( 'BU_HAU_DEBUG' ) ) {
			self::$debug = true;
		}

		self::setup_sync();

		if ( self::$debug && isset( $_GET['hau_sync'] ) ) {
			echo self::sync();
			die;
		}
	}

	/**
	 * Setup sync schedules
	 * @return null
	 */
	static function setup_sync() {
		add_action( self::PREFIX . 'sync_daily', array( self, 'sync' ) );
		if ( ! wp_next_scheduled( self::PREFIX . 'sync_daily' ) ) {
			wp_schedule_event( strtotime( self::SPACES_SYNC_TIME ), self::SPACES_SYNC_FREQ, self::PREFIX . 'sync_daily' );
		}
	}

	/**
	 * Sync the spaces, bookings, and housing codes
	 * Uses sample files when in Debug mode
	 * @return string output as written to media dir file
	 */
	static function sync() {
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
		self::write();
		self::prepare_output();
		return json_encode( self::$output );
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

		return true;
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
			if ( ! in_array( $summary_room_type, self::$space_types ) ) {
				self::$space_types[] = $summary_room_type;
			}

			if ( ! in_array( $space['Room Location'], self::$areas[$area_id]['buildings'] ) ) {
				self::$areas[$area_id]['buildings'][] = $space['Room Location'];
			}

			// units
			$unit_id = $space['Room Location Floor Suite'];
			if ( ! isset( self::$areas[$area_id]['units'][$unit_id] ) ) {

				self::$areas[$area_id]['units'][$unit_id] = array(
					'unitID'              => $unit_id,
					'location'            => $space['Room Location'],
					'floor'               => preg_replace( self::GET_FIRST_HSV, '', $space['Room Location Section'] ),
					'suite'               => str_replace( $space['Room Location Section'], '', $unit_id ),
					'unitTotalSpaces'     => 0,
					'unitAvailableSpaces' => 0,
					'gender'              => $space['Gender'],
					'specialty'           => self::get_specialty_code( $space['Specialty Cd'] ),
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
				self::$areas[$area_id]['roomCount']++;
				self::$areas[$area_id]['units'][$unit_id]['rooms'][$room] = array(
					'roomID'              => $room,
					'summaryRoomType'     => $summary_room_type,
					'roomType'            => $space['Room Type'],
					'room'                => preg_replace( self::GET_FIRST_HSV, '', $room),
					'roomTotalSpaces'     => 0,
					'roomAvailableSpaces' => 0,
					'spaceIDs'            => array( $space['Space ID'] ),
				);
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
		return isset( self::$housing_codes[$code] ) ? self::$housing_codes[$code] : '';
	}

	/**
	 * Writes the output to a WP media dir (relative to BU_HAU_MEDIA_DIR) file
	 * @return null
	 */
	static function write() {
		$wp_upload_dir = wp_upload_dir();
		$upload_file = $wp_upload_dir['basedir'] . BU_HAU_MEDIA_UNITS_FILE;
		$upload_path = dirname( $upload_file );

		if ( ! file_exists( $upload_path ) ) {
			if ( ! wp_mkdir_p( $upload_path ) ) {
				error_log( __FUNCTION__ . ': Failed to create dir for writing processed data: ' . $upload_path );
				return false;
			}
		}

		$handle = fopen( $upload_file, 'w+' );
		fwrite($handle, json_encode( self::$output ) );
		fclose($handle);
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
			'createTime' => self::$sync_start_time,
			'spaceTypes' => self::$space_types,
			'areas'      => self::$areas,
		);
	}
}
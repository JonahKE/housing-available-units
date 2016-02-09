<?php

class BU_HAU_Sync_Lock {
	const SYNC_LOCK    = 'bu_hau_sync_lock';
    private static $instance;
	private static $debug     = false;
	public static $start_time = null;
	public static $max_time   = null;

    /**
     * Returns the Singleton instance of this class.
     *
     * @return Singleton The *Singleton* instance.
     */
    public static function get_instance() {
        if (null === static::$instance) {
            static::$instance = new static();
        }

        return static::$instance;
    }

	static function setup( $start_time, $max_time = 500 ) {
		self::$start_time = $start_time;
		self::$max_time = $max_time;
	}

	static function lock() {
		self::auto_unlock_on_idle();
		$lock = get_option( self::SYNC_LOCK );
		if ( $lock ) {
			$msg = 'Skipping sync. Sync already started at ' . $lock;
			return new WP_Error( __METHOD__, $msg );
		}

		update_option( self::SYNC_LOCK, self::$start_time );
		if ( self::$debug ) {
			error_log( 'Lock time: ' . self::$start_time );
		}
		return true;
	}

	static function unlock() {
		delete_option( self::SYNC_LOCK );
	}

	/**
	 * Sync requests die out for a variety of reasons.
	 * We need to unlock once max reasonable time has passed.
	 */
	static function auto_unlock_on_idle() {
		if ( $lock_time = get_option( self::SYNC_LOCK ) ) {
			$current_time = time();

			if ( $lock_time < $current_time - self::$max_time ) {
				error_log( sprintf( '[%s] Unlocking idle lock from %s at %s.', __METHOD__, date( 'Y-m-d H:i:s', $lock_time ), date( 'Y-m-d H:i:s', $current_time ) ) );
				self::unlock();
			} else {
				error_log( sprintf( '[%s] Cannot unlock at %s. Lock time: %s, Max time: %s.', __METHOD__, date( 'Y-m-d H:i:s', $lock_time ), date( 'Y-m-d H:i:s', $current_time ), self::$max_time ) );
			}
		}
	}

	static function get_start_time( $formatted = false ) {
		if ( 'formatted' === $type ) {
			return date( 'Y-m-d H:i:s', self::$start_time );
		}
		return self::$start_time;
	}
}

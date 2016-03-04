<?php

class SyncTest extends WP_UnitTestCase {

	function testFullSync() {
		BU_HAU_Sync::init( true );

		$sync_str = BU_HAU_Sync::sync();

		// not error
		$this->assertNotEquals( $sync_str, false );

		// string output
		$this->assertInternalType( 'string', $sync_str );

		// json decodable
		$sync_arr = json_decode( $sync_str, true );
		$this->assertEquals( json_last_error(), JSON_ERROR_NONE );

		// array
		$this->assertTrue( is_array( $sync_arr ) );

		// unempty created time
		$this->assertTrue( ! empty( $sync_arr['createTime'] ) );

		// sync within last 60 seconds
		$current_time = time();
		$created_time = strtotime( $sync_arr['createTime'] );
		$this->assertTrue( $created_time > ( $current_time - 60 ) );

	}
}

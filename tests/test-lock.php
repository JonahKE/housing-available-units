<?php

class LockTest extends WP_UnitTestCase {

	function testLock() {

		BU_HAU_Sync_Lock::get_instance()->setup( time() );
		BU_HAU_Sync_Lock::get_instance()->unlock();

		$lock_result = BU_HAU_Sync_Lock::get_instance()->lock();
		$this->assertTrue( $lock_result );

		$auto_unlock = BU_HAU_Sync_Lock::get_instance()->auto_unlock_on_idle();
		$this->assertFalse( $auto_unlock );

		$lock_result = BU_HAU_Sync_Lock::get_instance()->lock();
		$this->assertTrue( is_wp_error( $lock_result ) );

		$unlock_result = BU_HAU_Sync_Lock::get_instance()->unlock();
		$this->assertTrue( $unlock_result );
	}
}

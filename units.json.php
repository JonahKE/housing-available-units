<?php 
ob_start("ob_gzhandler");

if( !empty($_GET['bootstrap']) ){
	header('Content-Type: application/javascript');
	echo "var _bootstrap = ";
} else {
	header('Content-Type: application/json');
}

$data = array(
	'meta' 				=> array(
							'name' => 'test',
							'template' => 'test2'
							),
	'areas'				=> array(),
	'units' 			=> array(),
	'rooms' 			=> array(),
	'totalRoomCount'	=> 0,
	);

$words = array( 'Sage', 'sedative', 'serene', 'servile', 'shackle', 'sleek', 'spontaneous', 'sporadic', 'stamina', 'stance', 'staple', 'stint', 'strident', 'sublime', 'subside', 'succumb', 'surpass', 'susceptible', 'swelter', 'Tedious', 'teem', 'theme', 'tirade', 'tract', 'transition', 'trepidation', 'turbulent', 'tycoon', 'Ultimate', 'ungainly', 'Vice versa', 'vie', 'vilify', 'voracious', 'Wage', 'wrangle', 'Abet', 'accord', 'adept', 'advocate', 'agile', 'allot', 'aloof', 'amiss', 'analogy', 'anarchy', 'antics', 'apprehend', 'ardent', 'articulate', 'assail', 'assimilate', 'atrocity', 'attribute', 'audacious', 'augment', 'authority', 'avail', 'avid', 'awry', 'Balmy', 'banter', 'barter', 'benign', 'bizarre', 'blasé', 'bonanza', 'bountiful', 'Cache', 'capacious', 'caption', 'chastise', 'citadel', 'cite', 'clad', 'clarify', 'commemorate', 'component', 'concept', 'confiscate', 'connoisseur', 'conscientious', 'conservative', 'contagious', 'conventional', 'convey', 'crucial', 'crusade', 'culminate', 'Deceptive', 'decipher', 'decree', 'deface', 'defect', 'deplore', 'deploy', 'desist', 'desolate', 'deter', 'dialect', 'dire', 'discern', 'disdain', 'disgruntled', 'dispatch', 'disposition', 'doctrine', 'dub', 'durable', 'Eccentric', 'elite', 'embargo', 'embark', 'encroach', 'endeavor', 'enhance', 'enigma', 'epoch', 'era', 'eventful', 'evolve', 'exceptional', 'excerpt', 'excruciating', 'exemplify', 'exotic', 'Facilitate', 'fallacy', 'fastidious', 'feasible', 'fend', 'ferret', 'flair', 'flustered', 'foreboding', 'forfeit', 'formidable', 'fortify', 'foster', 'Gaunt', 'gingerly', 'glut', 'grapple', 'grope', 'gullible', 'Haggard', 'haven', 'heritage', 'hindrance', 'hover', 'humane', 'Imperative', 'inaugurate', 'incense', 'indifferent', 'infinite', 'instill', 'institute', 'intervene', 'intricate', 'inventive', 'inventory', 'irascible', 'Jurisdiction', 'Languish', 'legendary', 'liberal', 'loll', 'lucrative', 'luminous', 'Memoir', 'mercenary', 'mien', 'millennium', 'minimize', 'modify', 'muse', 'muster', 'Onslaught', 'ornate', 'ovation', 'overt', 'Pang', 'panorama', 'perspective', 'phenomenon', 'pioneer', 'pithy', 'pivotal', 'plausible', 'plunder', 'porous', 'preposterous', 'principal', 'prodigy', 'proficient', 'profound', 'pseudonym', 'pungent', 'Rankle', 'rational', 'rebuke', 'reception', 'recourse', 'recur', 'renounce', 'renown', 'revenue', 'rubble', 'rue' );

$roomTypes = array( 'Apartment', 'Suite', 'Dormitory' );
$roomTypeNum = array( 'Single', 'Double', 'Triple', 'Quad' );
$gender = array( 'Male', 'Female', 'Gender Neutral' );
$specialty = array( 'Chinese House', 'Special House One', 'Special House Two' );

foreach ( range('A', 'C') as $l ) {
	$data['areas']['area'.$l] = array(
		'name' => 'Area ' . $l,
		'roomCount' => 0,
		'availableSpaceCount' => 0,
	);
}

while ( rand(8,15) > $data['totalRoomCount']) {
	$rw = array_rand( $words );
	$recentlyTaken 			= ( 2 == rand(1,4) );
	$streetNum 				= rand(1,1000);
	$roomType 				= $roomTypes[ rand(0,2) ];
	$unit 					= sprintf( "%d %s%s%s-%d", $streetNum, chr(65+rand(0,5)),chr(65+rand(0,5)),chr(65+rand(0,5)),str_pad( rand(1,1000), 4, "0", STR_PAD_LEFT) );
	$unitPersonCount		= rand(1,$roomSpacesCount);
	$unitSpacesCount 		= $roomSpacesCount + rand(0, 2);
	$maxUnitSpacesAvail 	= ( $unitSpacesCount - $roomSpacesAvailCount );
	$unitAvailableSpaces 	= $roomSpacesAvailCount + rand( 0, ( $maxUnitSpacesAvail ) );
	$area 					= $data['areas'][ array_rand( $data['areas'] ) ];

	$data['units'][$unit] = array(
		'area' 					=> $i,
		'location'				=> sprintf( "%d %s %s street", $streetNum, $words[ $rw[0] ], $words[ $rw[1] ] ),
		'floor' 				=> rand(1,5),
		'unitTotalSpaces'		=> $unitSpacesCount,
		'unitAvailableSpaces'	=> $unitAvailableSpaces,
		'gender'				=> $gender[ rand(0,2) ],
		'specialty'				=> $specialty[ rand(0,2) ],
		'rooms'					=> array(),
		);

	while ( rand(1,3) > count( $data['units'][$unit]['rooms'] ) ) {
		$room 					= chr(65+rand(0,5));
		$roomSpacesCount 		= array_search( $roomType, $roomTypes ) + 1;
		$roomSpacesAvailCount 	= ( $roomSpacesCount - rand(1,$unitPersonCount) );
		$roomID 				= sprintf( "%s-%s", $unit, $room );

		$data['units'][$unit]['rooms'][$roomID] = array(
			'key'					=> $data['totalRoomCount'],
			'area' 					=> $i,
			'summaryRoomType' 		=> $roomTypes[ rand(0,2) ],
			'roomType' 				=> sprintf( "%s-%dPerson-%s", $roomType, $unitPersonCount, $roomTypeNum[ rand(0,3) ] ),
			'room'					=> $room,
			'roomTotalSpaces'		=> $roomSpacesCount,
			'roomAvailableSpaces'	=> $roomSpacesAvailCount,
			);
		$data['totalRoomCount']++;
	}


	$data['areas'][$i]['roomCount']++;
	$data['areas'][$i]['availableSpaceCount'] += $roomSpacesAvailCount;

	// $data['units'][$unit]['roomsCount']++;
	// $data['units'][$unit]['area'] = $i;
	// $data['units'][$unit]['totalSpacesCount'] += $unitSpacesCount;
	// $data['units'][$unit]['availSpacesCount'] += $unitAvailableSpaces;
}

header('Access-Control-Allow-Origin: *');

echo json_encode($data);

if( !empty($_GET['bootstrap']) ){
	echo ";";
} 
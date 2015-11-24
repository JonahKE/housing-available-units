<?php 
ob_start("ob_gzhandler");

define( 'UNITS_PER_AREA', 15 );
define( 'ROOMS_PER_UNIT', 3 );

if( !empty($_GET['bootstrap']) ){
    header('Content-Type: application/javascript');
    echo "var _bootstrap = ";
} else {
    header('Content-Type: application/json');
}

$data = array(
    'metaData'          => array( 'name' => 'test', 'template' => 'test2' ),
    'areas'             => array(),
    'totalRoomCount'    => 0,
    );

$words          = array( 'Sage', 'sedative', 'serene', 'servile', 'shackle', 'sleek', 'spontaneous', 'sporadic', 'stamina', 'stance', 'staple', 'stint', 'strident', 'sublime', 'subside', 'succumb', 'surpass', 'susceptible', 'swelter', 'Tedious', 'teem', 'theme', 'tirade', 'tract', 'transition', 'trepidation', 'turbulent', 'tycoon', 'Ultimate', 'ungainly', 'Vice versa', 'vie', 'vilify', 'voracious', 'Wage', 'wrangle', 'Abet', 'accord', 'adept', 'advocate', 'agile', 'allot', 'aloof', 'amiss', 'analogy', 'anarchy', 'antics', 'apprehend', 'ardent', 'articulate', 'assail', 'assimilate', 'atrocity', 'attribute', 'audacious', 'augment', 'authority', 'avail', 'avid', 'awry', 'Balmy', 'banter', 'barter', 'benign', 'bizarre', 'blasé', 'bonanza', 'bountiful', 'Cache', 'capacious', 'caption', 'chastise', 'citadel', 'cite', 'clad', 'clarify', 'commemorate', 'component', 'concept', 'confiscate', 'connoisseur', 'conscientious', 'conservative', 'contagious', 'conventional', 'convey', 'crucial', 'crusade', 'culminate', 'Deceptive', 'decipher', 'decree', 'deface', 'defect', 'deplore', 'deploy', 'desist', 'desolate', 'deter', 'dialect', 'dire', 'discern', 'disdain', 'disgruntled', 'dispatch', 'disposition', 'doctrine', 'dub', 'durable', 'Eccentric', 'elite', 'embargo', 'embark', 'encroach', 'endeavor', 'enhance', 'enigma', 'epoch', 'era', 'eventful', 'evolve', 'exceptional', 'excerpt', 'excruciating', 'exemplify', 'exotic', 'Facilitate', 'fallacy', 'fastidious', 'feasible', 'fend', 'ferret', 'flair', 'flustered', 'foreboding', 'forfeit', 'formidable', 'fortify', 'foster', 'Gaunt', 'gingerly', 'glut', 'grapple', 'grope', 'gullible', 'Haggard', 'haven', 'heritage', 'hindrance', 'hover', 'humane', 'Imperative', 'inaugurate', 'incense', 'indifferent', 'infinite', 'instill', 'institute', 'intervene', 'intricate', 'inventive', 'inventory', 'irascible', 'Jurisdiction', 'Languish', 'legendary', 'liberal', 'loll', 'lucrative', 'luminous', 'Memoir', 'mercenary', 'mien', 'millennium', 'minimize', 'modify', 'muse', 'muster', 'Onslaught', 'ornate', 'ovation', 'overt', 'Pang', 'panorama', 'perspective', 'phenomenon', 'pioneer', 'pithy', 'pivotal', 'plausible', 'plunder', 'porous', 'preposterous', 'principal', 'prodigy', 'proficient', 'profound', 'pseudonym', 'pungent', 'Rankle', 'rational', 'rebuke', 'reception', 'recourse', 'recur', 'renounce', 'renown', 'revenue', 'rubble', 'rue' );
$roomTypes      = array( 'Apartment', 'Suite', 'Dormitory' );
$roomTypeNum    = array( 'Single', 'Double', 'Triple', 'Quad' );
$gender         = array( 'Male', 'Female', 'Gender Neutral' );
$specialty      = array( 'Chinese House', 'Special House One', 'Special House Two' );

foreach ( range('A', 'C') as $l ) {
    $areaID = 'area'.$l;
    $area = array(
        'id'                    => $areaID,
        'name'                  => 'Area ' . $l,
        'roomCount'             => 0,
        'availableSpaceCount'   => 0,
        'totalSpaceCount'       => 0,
        'spacesAvailableByType' => array(),
        'unitCount'             => UNITS_PER_AREA,
        'units'                 => array(),
        );

    foreach ($roomTypes as $rt) {
        $area['spacesAvailableByType'][$rt] = 0;
    }

    while ( $area['unitCount'] > count( $area['units'] ) ) {
        $rw = array_rand( $words );
        $streetNum              = rand(1,1000);
        $roomType               = $roomTypes[ rand(0,2) ];
        $unitID                 = sprintf( "%d %s%s%s-%d", $streetNum, chr(65+rand(0,5)),chr(65+rand(0,5)),chr(65+rand(0,5)),str_pad( rand(1,1000), 4, "0", STR_PAD_LEFT) );

        $unit = array(
            'id'                    => $unitID,
            'location'              => sprintf( "%d %s %s street", $streetNum, $words[ $rw[0] ], $words[ $rw[1] ] ),
            'floor'                 => rand(1,5),
            'unitTotalSpaces'       => 0,
            'unitAvailableSpaces'   => 0,
            'gender'                => $gender[ rand(0,2) ],
            'specialty'             => $specialty[ rand(0,2) ],
            'roomCount'             => ROOMS_PER_UNIT,
            'rooms'                 => array(),
            'spacesAvailableByType' => array(),
            );

        foreach ($roomTypes as $rt) {
            $unit['spacesAvailableByType'][$rt] = 0;
        }

        while ( $unit['roomCount'] > count( $unit['rooms'] ) ) {
            $room               = chr(65+rand(0,5));
            $spacesCount        = array_search( $roomType, $roomTypes ) + 1;
            $spacesAvailCount   = ( $spacesCount - rand(1,$spacesCount) );
            $roomID             = sprintf( "%s-%s", $unitID, $room );
            $roomType           = $roomTypes[ rand(0,2) ];

            $unit['rooms'][] = array(
                // 'key'                    => $data['totalRoomCount'],
                'id'                    => $roomID,
                'summaryRoomType'       => $roomType,
                'roomType'              => sprintf( "%s-%dPerson-%s", $roomType, $spacesCount, $roomTypeNum[ rand(0,3) ] ),
                'room'                  => $room,
                'roomTotalSpaces'       => $spacesCount,
                'roomAvailableSpaces'   => $spacesAvailCount,
                );

            $data['totalRoomCount']++;
            $unit['unitTotalSpaces'] += $spacesCount;
            $unit['unitAvailableSpaces'] += $spacesAvailCount;
            $unit['spacesAvailableByType'][$roomType] += $spacesAvailCount;
        }

        $area['roomCount']++;
        $area['availableSpaceCount'] += $unit['unitAvailableSpaces'];
        $area['totalSpaceCount'] += $unit['unitTotalSpaces'];
        
        foreach ($roomTypes as $rt) {
            $area['spacesAvailableByType'][$rt] += $unit['spacesAvailableByType'][$rt];
        }
        $area['units'][] = $unit;
    }
    $data['areas'][] = $area;
}

header('Access-Control-Allow-Origin: *');

echo json_encode($data);

if( !empty($_GET['bootstrap']) ){
    echo ";";
} 
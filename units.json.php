<?php 
ob_start("ob_gzhandler");

if( !empty($_GET['bootstrap']) ){
	header('Content-Type: application/javascript');
	echo "var _bootstrap = ";
} else {
	header('Content-Type: application/json');
}

$data = array(
	'meta' => array(
		'name' => 'test',
		'template' => 'test2'
		),
	'groups' => array(),
	'rooms' => array(),
	'roomCount' => 0,
	);

$words = array( 'Sage', 'sedative', 'serene', 'servile', 'shackle', 'sleek', 'spontaneous', 'sporadic', 'stamina', 'stance', 'staple', 'stint', 'strident', 'sublime', 'subside', 'succumb', 'surpass', 'susceptible', 'swelter', 'Tedious', 'teem', 'theme', 'tirade', 'tract', 'transition', 'trepidation', 'turbulent', 'tycoon', 'Ultimate', 'ungainly', 'Vice versa', 'vie', 'vilify', 'voracious', 'Wage', 'wrangle', 'Abet', 'accord', 'adept', 'advocate', 'agile', 'allot', 'aloof', 'amiss', 'analogy', 'anarchy', 'antics', 'apprehend', 'ardent', 'articulate', 'assail', 'assimilate', 'atrocity', 'attribute', 'audacious', 'augment', 'authority', 'avail', 'avid', 'awry', 'Balmy', 'banter', 'barter', 'benign', 'bizarre', 'blasé', 'bonanza', 'bountiful', 'Cache', 'capacious', 'caption', 'chastise', 'citadel', 'cite', 'clad', 'clarify', 'commemorate', 'component', 'concept', 'confiscate', 'connoisseur', 'conscientious', 'conservative', 'contagious', 'conventional', 'convey', 'crucial', 'crusade', 'culminate', 'Deceptive', 'decipher', 'decree', 'deface', 'defect', 'deplore', 'deploy', 'desist', 'desolate', 'deter', 'dialect', 'dire', 'discern', 'disdain', 'disgruntled', 'dispatch', 'disposition', 'doctrine', 'dub', 'durable', 'Eccentric', 'elite', 'embargo', 'embark', 'encroach', 'endeavor', 'enhance', 'enigma', 'epoch', 'era', 'eventful', 'evolve', 'exceptional', 'excerpt', 'excruciating', 'exemplify', 'exotic', 'Facilitate', 'fallacy', 'fastidious', 'feasible', 'fend', 'ferret', 'flair', 'flustered', 'foreboding', 'forfeit', 'formidable', 'fortify', 'foster', 'Gaunt', 'gingerly', 'glut', 'grapple', 'grope', 'gullible', 'Haggard', 'haven', 'heritage', 'hindrance', 'hover', 'humane', 'Imperative', 'inaugurate', 'incense', 'indifferent', 'infinite', 'instill', 'institute', 'intervene', 'intricate', 'inventive', 'inventory', 'irascible', 'Jurisdiction', 'Languish', 'legendary', 'liberal', 'loll', 'lucrative', 'luminous', 'Memoir', 'mercenary', 'mien', 'millennium', 'minimize', 'modify', 'muse', 'muster', 'Onslaught', 'ornate', 'ovation', 'overt', 'Pang', 'panorama', 'perspective', 'phenomenon', 'pioneer', 'pithy', 'pivotal', 'plausible', 'plunder', 'porous', 'preposterous', 'principal', 'prodigy', 'proficient', 'profound', 'pseudonym', 'pungent', 'Rankle', 'rational', 'rebuke', 'reception', 'recourse', 'recur', 'renounce', 'renown', 'revenue', 'rubble', 'rue' );

foreach (range('A', 'T') as $l) {
	$data['groups'][] = array(
		'id'   => 'group' . $l,
		'name' => 'Area ' . $l,
		'roomCount' => 0,
		'availableRoomCount' => 0,
	);
}

foreach ($data['groups'] as $i => $g) {
	$x = 0;
	while ( 402 > $x) {
		$rw = array_rand( $words, 10 );
		$recentlyTaken = ( 2 == rand(1,4) );
		$data['rooms'][$g['id']][] = array(
			'key' => $data['roomCount'],
			'name'  => $words[ $rw[0] ] . " " . $words[ $rw[1] ] . " " . $words[ $rw[2] ] . " " . $words[ $rw[3] ] . " " . $words[ $rw[4] ],
			'details' => $words[ $rw[5] ] . " " . $words[ $rw[6] ] . " " . $words[ $rw[7] ] . " " . $words[ $rw[8] ] . " " . $words[ $rw[9] ],
			'wasRecentlyTaken' => $recentlyTaken, // indicator that room is no longer available & will be pulled from the list on the next update.
			);
		$x++;
		$data['roomCount']++;
		$data['groups'][$i]['roomCount']++;
		
		if(!$recentlyTaken){
			$data['groups'][$i]['availableRoomCount']++;
		}
	}
}

header('Access-Control-Allow-Origin: *');

echo json_encode($data);

if( !empty($_GET['bootstrap']) ){
	echo ";";
} 
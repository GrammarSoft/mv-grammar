<?php

$vars = ['DEBUG_KEY', 'DANPROOF_HOST', 'DANPROOF_PORT', 'COMMA_URL', 'MVID_SERVICE', 'MVID_SECRET', 'MVID_ACCESS_IDS', 'GOOGLE_AID'];
foreach ($vars as $var) {
	$env = getenv($var);
	if (empty($_ENV[$var])) {
		$_ENV[$var] = empty($env) ? null : $env;
	}
}

$GLOBALS['-config'] = [];
$GLOBALS['-config']['DEBUG_KEY'] = $_ENV['DEBUG_KEY'];
$GLOBALS['-config']['DANPROOF_HOST'] = $_ENV['DANPROOF_HOST'] ?? 'localhost';
$GLOBALS['-config']['DANPROOF_PORT'] = $_ENV['DANPROOF_PORT'] ?? 13400;
$GLOBALS['-config']['COMMA_URL'] = $_ENV['COMMA_URL'];
$GLOBALS['-config']['MVID_SERVICE'] = $_ENV['MVID_SERVICE'] ?? 'grammateket';
$GLOBALS['-config']['MVID_SECRET'] = $_ENV['MVID_SECRET'];
$GLOBALS['-config']['MVID_ACCESS_IDS'] = $_ENV['MVID_ACCESS_IDS'] ?? 'product.web.da.grammarsuggestions.release';
$GLOBALS['-config']['GOOGLE_AID'] = $_ENV['GOOGLE_AID'];

$GLOBALS['-config']['MVID_ACCESS_IDS'] = explode(',', trim(preg_replace('[,+]', ',', preg_replace('~[\s\r\n\t]+~', ',', $GLOBALS['-config']['MVID_ACCESS_IDS'])), ','));

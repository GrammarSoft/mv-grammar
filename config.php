<?php

$vars = ['DANPROOF_HOST', 'DANPROOF_PORT', 'MVID_SHARED_KEY', 'MVID_DOMAIN', 'MVID_ACCESS_IDS', 'GOOGLE_AID'];
foreach ($vars as $var) {
	$env = getenv($var);
	if (empty($_ENV[$var])) {
		$_ENV[$var] = empty($env) ? null : $env;
	}
}

$GLOBALS['-config'] = [];
$GLOBALS['-config']['DANPROOF_HOST'] = $_ENV['DANPROOF_HOST'] ?? 'localhost';
$GLOBALS['-config']['DANPROOF_PORT'] = $_ENV['DANPROOF_PORT'] ?? 13400;
$GLOBALS['-config']['MVID_SHARED_KEY'] = $_ENV['MVID_SHARED_KEY'];
$GLOBALS['-config']['MVID_DOMAIN'] = $_ENV['MVID_DOMAIN'] ?? 'localhost';
$GLOBALS['-config']['MVID_ACCESS_IDS'] = $_ENV['MVID_ACCESS_IDS'] ?? 'product.web.da.grammarsuggestions.release';
$GLOBALS['-config']['GOOGLE_AID'] = $_ENV['GOOGLE_AID'] ?? null;

$GLOBALS['-config']['MVID_ACCESS_IDS'] = explode(',', trim(preg_replace('[,+]', ',', preg_replace('~[\s\r\n\t]+~', ',', $GLOBALS['-config']['MVID_ACCESS_IDS'])), ','));

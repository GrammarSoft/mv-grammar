<?php

$vars = ['DEBUG_KEY', 'GRAMMAR_DA_HOST', 'GRAMMAR_DA_PORT', 'GRAMMAR_NB_HOST', 'GRAMMAR_NB_PORT', 'GRAMMAR_SV_HOST', 'GRAMMAR_SV_PORT', 'COMMA_HOST', 'COMMA_PORT', 'COMMA_URL', 'MVID_SERVICE', 'MVID_SECRET', 'MVID_ACCESS_IDS', 'CADUCEUS_URL', 'CADUCEUS_SECRET', 'GOOGLE_AID', 'HMAC_SERVICE', 'MV_SERVICES_HOST', 'MV_SIGNON_HOST', 'MV_SIGNON_API_HOST', 'MV_IW_DICT_HOST', 'MV_IW_ONLINE_HOST', 'MV_TEST'];
foreach ($vars as $var) {
	$env = getenv($var);
	if (empty($_ENV[$var])) {
		$_ENV[$var] = empty($env) ? null : $env;
	}
}

$GLOBALS['-config'] = [];
$GLOBALS['-config']['DEBUG_KEY'] = $_ENV['DEBUG_KEY'];
$GLOBALS['-config']['GRAMMAR_DA_HOST'] = $_ENV['GRAMMAR_DA_HOST'] ?? 'localhost';
$GLOBALS['-config']['GRAMMAR_DA_PORT'] = $_ENV['GRAMMAR_DA_PORT'] ?? 13400;
$GLOBALS['-config']['GRAMMAR_NB_HOST'] = $_ENV['GRAMMAR_NB_HOST'] ?? 'localhost';
$GLOBALS['-config']['GRAMMAR_NB_PORT'] = $_ENV['GRAMMAR_NB_PORT'] ?? 13500;
$GLOBALS['-config']['GRAMMAR_SV_HOST'] = $_ENV['GRAMMAR_SV_HOST'] ?? 'localhost';
$GLOBALS['-config']['GRAMMAR_SV_PORT'] = $_ENV['GRAMMAR_SV_PORT'] ?? 13600;
$GLOBALS['-config']['COMMA_HOST'] = $_ENV['COMMA_HOST'] ?? 'localhost';
$GLOBALS['-config']['COMMA_PORT'] = $_ENV['COMMA_PORT'] ?? 13300;
$GLOBALS['-config']['COMMA_URL'] = $_ENV['COMMA_URL'];
$GLOBALS['-config']['MVID_SERVICE'] = $_ENV['MVID_SERVICE'] ?? 'grammateket';
$GLOBALS['-config']['MVID_SECRET'] = $_ENV['MVID_SECRET'];
$GLOBALS['-config']['MVID_ACCESS_IDS'] = $_ENV['MVID_ACCESS_IDS'] ?? 'product.web.da.grammarsuggestions.release,product.web.sv.grammarsuggestions.release,product.web.nb.grammarsuggestions.release';
$GLOBALS['-config']['CADUCEUS_URL'] = $_ENV['CADUCEUS_URL'] ?? 'ws://localhost:3000/';
$GLOBALS['-config']['CADUCEUS_SECRET'] = $_ENV['CADUCEUS_SECRET'] ?? gethostname();
$GLOBALS['-config']['GOOGLE_AID'] = $_ENV['GOOGLE_AID'];
$GLOBALS['-config']['HMAC_SERVICE'] = $_ENV['HMAC_SERVICE'] ?? 'grammar';

$GLOBALS['-config']['MV_TEST'] = $_ENV['MV_TEST'] ?? false;
if (!empty($GLOBALS['-config']['MV_TEST'])) {
	$GLOBALS['-config']['MV_SIGNON_HOST'] = 'signon.vitec-mv.com';
	$GLOBALS['-config']['MV_SIGNON_API_HOST'] = 'mvidsignonapi.vitec-mv.com';
	$GLOBALS['-config']['MV_IW_DICT_HOST'] = 'online-mvid-dev.intowords.com';
	$GLOBALS['-config']['MV_IW_ONLINE_HOST'] = 'online-mvid-dev.intowords.com';
}
else {
	$GLOBALS['-config']['MV_SIGNON_HOST'] = 'signon.vitec-mv.com';
	$GLOBALS['-config']['MV_SIGNON_API_HOST'] = 'mvidsignonapi.vitec-mv.com';
	$GLOBALS['-config']['MV_IW_DICT_HOST'] = 'dictionary.intowords.com';
	$GLOBALS['-config']['MV_IW_ONLINE_HOST'] = 'online.intowords.com';
}

$GLOBALS['-config']['MV_SIGNON_HOST'] = $_ENV['MV_SIGNON_HOST'] ?? $GLOBALS['-config']['MV_SIGNON_HOST'];
$GLOBALS['-config']['MV_SIGNON_API_HOST'] = $_ENV['MV_SIGNON_API_HOST'] ?? $GLOBALS['-config']['MV_SIGNON_API_HOST'];
$GLOBALS['-config']['MV_IW_DICT_HOST'] = $_ENV['MV_IW_DICT_HOST'] ?? $GLOBALS['-config']['MV_IW_DICT_HOST'];
$GLOBALS['-config']['MV_IW_ONLINE_HOST'] = $_ENV['MV_IW_ONLINE_HOST'] ?? $GLOBALS['-config']['MV_IW_ONLINE_HOST'];

$GLOBALS['-config']['MVID_ACCESS_IDS'] = explode(',', trim(preg_replace('[,+]', ',', preg_replace('~[\s\r\n\t]+~', ',', $GLOBALS['-config']['MVID_ACCESS_IDS'])), ','));

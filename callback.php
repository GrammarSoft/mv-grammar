<?php

header('HTTP/1.1 400 Bad Request');
$a = !empty($_REQUEST['a']) ? $_REQUEST['a'] : '';

$origin = '*';
if (!empty($_SERVER['HTTP_ORIGIN'])) {
	$origin = trim($_SERVER['HTTP_ORIGIN']);
}
header('Access-Control-Allow-Origin: '.$origin);
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	header('HTTP/1.1 200 Options');
	header('Access-Control-Allow-Headers: HMAC, *');
	die();
}

require_once __DIR__.'/mvid_ai.php';
$access = mvid_check_access($GLOBALS['mv-session-id']);

$start = microtime(true);
$acl = null;
$rv = [
	'e' => [],
	'a' => $a,
	];

while ($a === 'keepalive') {
	if (!$GLOBALS['hmac-fresh']) {
		$rv['keepalive'] = mvid_keepalive($GLOBALS['mv-session-id']);
		if (!$rv['keepalive']) {
			$rv['e'][] = 'Could not keepalive session';
			break;
		}
	}
	$rv['hmac'] = $GLOBALS['access-hmac'];
	$rv['sessionid'] = $GLOBALS['mv-session-id'];
	break;
}

while ($a === 'logout') {
	setcookie('mv-session-id', '', time() + 86400, '/', '', true);
	setcookie('access-hmac', '', time() + 86400, '/', '', true);
	$rv['logout'] = true;
	break;
}

while ($a === 'itw-dict') {
	if (empty($GLOBALS['mv-session-id'])) {
		$rv['e'][] = 'Invalid or empty session ID!';
		break;
	}
	if (empty($_REQUEST['t'])) {
		$rv['e'][] = 'Invalid or empty text!';
		break;
	}

	require_once __DIR__.'/itw_proxy.php';

	$ret = itw_dict($GLOBALS['mv-session-id'], $_REQUEST['t']);
	if ($ret === false) {
		$rv['e'][] = 'Invalid or empty result from IntoWords Dictionary!';
		break;
	}

	header('HTTP/1.1 200 Ok');
	header('Content-Type: application/json; charset=UTF-8');
	echo $ret;

	die(); // Not break
}

while ($a === 'itw-speak') {
	if (empty($GLOBALS['mv-session-id'])) {
		$rv['e'][] = 'Invalid or empty session ID!';
		break;
	}
	if (empty($_REQUEST['t'])) {
		$rv['e'][] = 'Invalid or empty text!';
		break;
	}

	require_once __DIR__.'/itw_proxy.php';

	$ret = itw_speak($GLOBALS['mv-session-id'], $_REQUEST['t']);
	if ($ret === false) {
		$rv['e'][] = 'Invalid or empty result from IntoWords TTS!';
		break;
	}

	header('HTTP/1.1 200 Ok');
	header('Content-Type: application/json; charset=UTF-8');
	echo $ret;

	die(); // Not break
}

while ($a === 'grammar') {
	if (empty($_SERVER['HTTP_HMAC'])) {
		$rv['e'][] = 'Invalid or empty HMAC header!';
		break;
	}
	if (!$access) {
		header('HTTP/1.1 403 Forbidden - check your MV-ID access');
		die();
	}

	if (preg_match_all('~<(STYLE:\w+:\w+)>~u', $_REQUEST['t'], $ms, PREG_SET_ORDER)) {
		foreach ($ms as $m) {
			// Shuffle whitespace from inside the style to outside the style
			$_REQUEST['t'] = preg_replace('~\Q'.$m[0].'\E(\s+)~us', '\1'.$m[0], $_REQUEST['t']);
			$_REQUEST['t'] = preg_replace('~(\s+)</\Q'.$m[1].'\E>~us', '</'.$m[1].'>\1', $_REQUEST['t']);
			// Remove now-empty styles
			$_REQUEST['t'] = preg_replace('~\Q'.$m[0].'\E</\Q'.$m[1].'\E>~us', '', $_REQUEST['t']);
			// Remove styles that are fully inside words
			$_REQUEST['t'] = preg_replace('~([\pL\pN\pM])\Q'.$m[0].'\E(.+)</\Q'.$m[1].'\E>([\pL\pN\pM])~us', '\1\2\3', $_REQUEST['t']);
		}
	}

	$nonce = mt_rand();
	$nonced = preg_replace('~<(/?s\d+)>~', '<$1-'.$nonce.'>', $_REQUEST['t']);

	for ($try=0 ; $try < 3 ; ++$try) {
		$port = $GLOBALS['-config']['GRAMMAR_PORT'];
		//header('X-RetMig-Port: '.$port, false);
		$s = fsockopen($GLOBALS['-config']['GRAMMAR_HOST'], $port, $errno, $errstr, 1);
		if ($s === false) {
			$e = json_encode_num([__LINE__, $errno, $GLOBALS['-config']['GRAMMAR_HOST'], $port]);
			header('X-RetMig-Error: '.$e, false);
			continue;
		}
		//header('X-10-Connect: '.(microtime(true) - $start), false);
		if (fwrite($s, $nonced."\n<END-OF-INPUT>\n") === false) {
			$e = json_encode_num([__LINE__, $GLOBALS['-config']['GRAMMAR_HOST'], $port]);
			header('X-RetMig-Error: '.$e, false);
			continue;
		}
		//header('X-20-Write: '.(microtime(true) - $start), false);
		$output = stream_get_contents($s);
		//header('X-30-Read: '.(microtime(true) - $start), false);
		$output = trim($output);
		if (!preg_match('~<s\d+-'.$nonce.'>\n~', $output)) {
			$output = '';
		}
		if (!empty($output)) {
			$rv['c'] = $output;
			break;
		}
	}

	$rv['c'] = preg_replace('~<(/?s\d+)-\d+>~', '<$1>', $rv['c']);

	break;
}

while ($a === 'comma') {
	if (empty($_SERVER['HTTP_HMAC'])) {
		$rv['e'][] = 'Invalid or empty HMAC header!';
		break;
	}
	if (!$access) {
		header('HTTP/1.1 403 Forbidden - check your MV-ID access');
		die();
	}

	if (preg_match_all('~<(STYLE:\w+:\w+)>~u', $_REQUEST['t'], $ms, PREG_SET_ORDER)) {
		foreach ($ms as $m) {
			// Shuffle whitespace from inside the style to outside the style
			$_REQUEST['t'] = preg_replace('~\Q'.$m[0].'\E(\s+)~us', '\1'.$m[0], $_REQUEST['t']);
			$_REQUEST['t'] = preg_replace('~(\s+)</\Q'.$m[1].'\E>~us', '</'.$m[1].'>\1', $_REQUEST['t']);
			// Remove now-empty styles
			$_REQUEST['t'] = preg_replace('~\Q'.$m[0].'\E</\Q'.$m[1].'\E>~us', '', $_REQUEST['t']);
			// Remove styles that are fully inside words
			$_REQUEST['t'] = preg_replace('~([\pL\pN\pM])\Q'.$m[0].'\E(.+)</\Q'.$m[1].'\E>([\pL\pN\pM])~us', '\1\2\3', $_REQUEST['t']);
		}
	}

	$nonce = mt_rand();
	$nonced = preg_replace('~<(/?s\d+)>~', '<$1-'.$nonce.'>', $_REQUEST['t']);

	for ($try=0 ; $try < 3 ; ++$try) {
		$port = $GLOBALS['-config']['COMMA_PORT'];
		//header('X-Komma-Port: '.$port, false);
		$s = fsockopen($GLOBALS['-config']['COMMA_HOST'], $port, $errno, $errstr, 1);
		if ($s === false) {
			$e = json_encode_num([__LINE__, $errno, $GLOBALS['-config']['COMMA_HOST'], $port]);
			header('X-Komma-Error: '.$e, false);
			continue;
		}
		//header('X-10-Connect: '.(microtime(true) - $start), false);
		if (fwrite($s, $nonced."\n<END-OF-INPUT>\n") === false) {
			$e = json_encode_num([__LINE__, $GLOBALS['-config']['COMMA_HOST'], $port]);
			header('X-Komma-Error: '.$e, false);
			continue;
		}
		//header('X-20-Write: '.(microtime(true) - $start), false);
		$output = stream_get_contents($s);
		//header('X-30-Read: '.(microtime(true) - $start), false);
		$output = trim($output);
		if (!preg_match('~<s\d+-'.$nonce.'>\n~', $output)) {
			$output = '';
		}
		if (!empty($output)) {
			$rv['c'] = $output;
			break;
		}
	}

	$rv['c'] = preg_replace('~<(/?s\d+)-\d+>~', '<$1>', $rv['c']);

	break;
}

if (empty($rv['e'])) {
	header('HTTP/1.1 200 Ok');
	unset($rv['e']);
}

if (!empty($_GET['callback'])) {
	header('Content-Type: application/javascript; charset=UTF-8');
	echo $_GET['callback'].'('.json_encode_num($rv).');';
}
else {
	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode_num($rv);
}

flush();
if (function_exists('fastcgi_finish_request')) {
	fastcgi_finish_request();
}

if (!empty($rv['e'])) {
	exit(0);
}

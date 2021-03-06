<?php

require_once __DIR__.'/mvid_ai.php';

$GLOBALS['itw-dicts'] = [
	'da' => 1, // Den Danske Ordbog (DDO)
	'no' => 2, // Norsk bokmål
	'nb' => 2, // Norsk bokmål
	'nn' => 7, // Nynorsk
	'sv' => 8, // Natur och Kulturs Stora Svenska Ordbok (NoK)
	];

function itw_curl($url, $rq) {
	$rq = json_encode_num($rq);

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_HEADER, false);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, [
		'Accept: application/json',
		'Content-Type: application/json',
		'Content-Length: '.strlen($rq),
		]);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $rq);
	$ret = curl_exec($ch);
	if ($ret === false) {
		$err = fopen('php://stderr', 'wb');
		fprintf($err, 'CURL Error: %s', curl_error($ch));
		return false;
	}
	$e = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);

	if ($e < 200 || $e >= 400) {
		header('X-ITW-Curl: '.$e);
		return false;
	}

	return $ret;
}

function itw_dict($sessionid, $text) {
	$dict = 1;
	$locale = mvid_locale();
	if (!empty($locale) && !empty($GLOBALS['itw-dicts'][$locale])) {
		$dict = $GLOBALS['itw-dicts'][$locale];
	}

	$rq = [
		'type' => 'jsonwsp/request',
		'version' => '1.0',
		'methodname' => 'search',
		'args' => [
			'session_id' => $sessionid,
			'searchString' => trim($text),
			'dictID' => $dict,
			],
		];

	$rv = itw_curl('https://'.$GLOBALS['-config']['MV_IW_DICT_HOST'].'/dictservice/DictionaryService/jsonwsp', $rq);
	if ($rv === false) {
		header('X-ITW-Dict: CURL error');
		return false;
	}
	$rv = json_decode($rv, true);
	if (empty($rv['result']['value'][0]['Key'])) {
		if (preg_match('~^(.+?)[\pP\pS\W]+$~u', $text, $m)) {
			return itw_dict($sessionid, $m[1]);
		}
		header('X-ITW-Dict: Empty result');
		return false;
	}

	$rq = [
		'type' => 'jsonwsp/request',
		'version' => '1.0',
		'methodname' => 'getArticle',
		'args' => [
			'session_id' => $sessionid,
			'dictID' => $dict,
			'word' => trim($rv['result']['value'][0]['Word']),
			'key' => trim($rv['result']['value'][0]['Key']),
			'settings' => null,
			],
		];

	return itw_curl('https://'.$GLOBALS['-config']['MV_IW_DICT_HOST'].'/dictservice/DictionaryService/jsonwsp', $rq);
}

function itw_get_dicts($sessionid) {
	$rq = [
		'type' => 'jsonwsp/request',
		'version' => '1.0',
		'methodname' => 'getDictionaries',
		'args' => [
			'session_id' => $sessionid,
			],
		];

	$rv = itw_curl('https://'.$GLOBALS['-config']['MV_IW_DICT_HOST'].'/dictservice/DictionaryService/jsonwsp', $rq);
	if ($rv === false) {
		header('X-ITW-GetDicts: CURL error');
		return false;
	}

	$rv = json_decode($rv, true);
	if (empty($rv['result']['value'])) {
		header('X-ITW-GetDicts: Empty result');
		return false;
	}

	return $rv['result']['value'];
}

function itw_search_dict($sessionid, $text, $dict=1) {
	$rq = [
		'type' => 'jsonwsp/request',
		'version' => '1.0',
		'methodname' => 'search',
		'args' => [
			'session_id' => $sessionid,
			'searchString' => $text,
			'dictID' => $dict,
			],
		];

	return itw_curl('https://'.$GLOBALS['-config']['MV_IW_DICT_HOST'].'/dictservice/DictionaryService/jsonwsp', $rq);
}

function itw_speak($sessionid, $text) {
	$rq = [
		'type' => 'jsonwsp/request',
		'version' => '1.0',
		'methodname' => 'speak',
		'args' => [
			'session_id' => $sessionid,
			'text' => trim($text),
			'return_indices' => false,
			'type' => 'mp3',
			],
		];

	return itw_curl('https://'.$GLOBALS['-config']['MV_IW_ONLINE_HOST'].'/intowords-v3/tts/jsonwsp', $rq);
}

<?php
require_once __DIR__.'/mvid_ai.php';
$mv_has_access = mvid_check_access($GLOBALS['mv-session-id']);

$_REQUEST['channel'] = $_REQUEST['channel'] ?? '';
if ($mv_has_access && !empty($_REQUEST['channel'])) {
	require_once 'vendor/autoload.php';
	$client = new \WebSocket\Client($GLOBALS['-config']['CADUCEUS_URL']);

	$msg = ['a' => 'push-channel', 'name' => $_REQUEST['channel'], 'data' => [
		'sessionid' => $GLOBALS['mv-session-id'],
		'hmac' => $GLOBALS['access-hmac'],
		]];
	$msg['sig'] = hmac_sha256_b64($msg['a'].$msg['name'], $GLOBALS['-config']['CADUCEUS_SECRET']);
	$msg = json_encode_num($msg);
	$client->send($msg);
}

?>
<!DOCTYPE html>
<html lang="da">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title data-l10n="TITLE_LOGIN">Grammateket Login</title>

	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Oswald:300,700|Open+Sans:400,300">
	<link rel="stylesheet" href="static/login.css?<?=filemtime(__DIR__.'/static/login.css');?>">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
	<script src="static/l10n.js"></script>
</head>
<body>

<div id="wrap" onclick="doLogin();"></div>

<div id="margin_container">
	<div id="mainnav">
		<a href="#" onclick="doLogin();"><img src="static/key.png"></a>
	</div>
	<div id="pitch">
		<a href="https://www.mv-nordic.com/" data-l10n="TXT_PITCH_MVNORDIC"><span>Kontakt MV-Nordic</span> for at prøve programmet gratis eller for information om abonnement.<br>
		(<em>gælder skoler, institutioner og virksomheder</em>)</a><br><br>

		<a href="https://retmig.dk/" data-l10n="TXT_PITCH_GRAMMARSOFT">For privatlicenser, kontakt GrammarSoft på <span>retmig.dk</span></a>
	</div>
</div>

<script type="text/javascript">
let mv_session_id = <?=json_encode_num($GLOBALS['mv-session-id']);?>;
let access_hmac = <?=json_encode_num($GLOBALS['access-hmac']);?>;
let mv_has_access = <?=($mv_has_access ? 'true' : 'false');?>;
let channel = <?=json_encode_num($_REQUEST['channel']);?>;

function doLogin() {
	let uri = 'https://signon.vitec-mv.com/?returnUrl=';
	let ret = window.location.origin + window.location.pathname + '?channel=' + channel;
	if (window.location.search.indexOf('embedded=1') !== -1) {
		ret += '&popup=1';
		uri += encodeURIComponent(ret);
		window.open(uri, 'mvid-signon');
	}
	else if (window.location.search.indexOf('popup=1') !== -1) {
		ret += '&popup=1';
		uri += encodeURIComponent(ret);
		window.location = uri;
	}
	else {
		uri += encodeURIComponent(ret);
		window.location = uri;
	}
}

$(function() {
	if (mv_has_access) {
		if (window.location.search.indexOf('popup=1') !== -1) {
			console.log('Popup posting back');
			if (window.opener) {
				window.opener.postMessage({sessionid: mv_session_id, hmac: access_hmac, access: mv_has_access}, '*');
			}
			if (window.opener && window.opener.parent) {
				window.opener.parent.postMessage({sessionid: mv_session_id, hmac: access_hmac, access: mv_has_access}, '*');
			}
			if (window.top === window) {
				console.log('Popup closing itself');
				$('body').html('<div class="midmid"><div>'+l10n.t('TXT_LOGIN_SUCCESS')+'</div></div>');
				window.close();
			}
			return;
		}
		if (window.location.search.indexOf('embedded=1') !== -1) {
			console.log('IFrame posting back');
			window.parent.postMessage({sessionid: mv_session_id, hmac: access_hmac, access: mv_has_access}, '*');
			window.top.postMessage({sessionid: mv_session_id, hmac: access_hmac, access: mv_has_access}, '*');
			return;
		}
		document.location = './';
		return;
	}

	if (mv_session_id && !mv_has_access && window.location.href.indexOf('SessionID=') !== -1) {
		alert(l10n.t('ERR_LOGIN_NOACCESS'));
		return;
	}

	if (window.location.search.indexOf('popup=1') !== -1) {
		doLogin();
		return;
	}
	if (window.location.search.indexOf('embedded=1') !== -1) {
		doLogin();
		return;
	}
});
</script>

</body>
</html>

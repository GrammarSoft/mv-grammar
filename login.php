<?php
require_once __DIR__.'/mvid_ai.php';
$mv_has_access = mvid_check_access($GLOBALS['mv-session-id']);

?>
<!DOCTYPE html>
<html lang="da">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Grammateket Login</title>

	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Oswald:300,700|Open+Sans:400,300">
	<link rel="stylesheet" href="static/login.css?<?=filemtime(__DIR__.'/static/login.css');?>">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
</head>
<body>

<div id="wrap" onclick="doLogin();"></div>

<div id="margin_container">
	<div id="mainnav">
		<a href="#" onclick="doLogin();"><img src="static/key.png"></a>
	</div>
	<div id="pitch">
		<a href="https://www.mv-nordic.com/"><span>Kontakt MV-Nordic</span> for at prøve programmet gratis eller for information om abonnement.<br>
		(<em>gælder skoler, institutioner og virksomheder</em>)</a><br><br>

		<a href="https://retmig.dk/">For privatlicenser, kontakt GrammarSoft på <span>retmig.dk</span></a>
	</div>
</div>

<script type="text/javascript">
let mv_session_id = <?=json_encode_num($GLOBALS['mv-session-id']);?>;
let access_hmac = <?=json_encode_num($GLOBALS['access-hmac']);?>;
let mv_has_access = <?=($mv_has_access ? 'true' : 'false');?>;

function doLogin() {
	let uri = 'https://signon.vitec-mv.com/?returnUrl=';
	let ret = window.location.origin + window.location.pathname;
	if (window.location.search.indexOf('embedded=1') !== -1) {
		ret += '?popup=1';
		uri += encodeURIComponent(ret);
		window.open(uri, 'mvid-signon');
	}
	else if (window.location.search.indexOf('popup=1') !== -1) {
		ret += '?popup=1';
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
			window.opener.postMessage({sessionid: mv_session_id, hmac: access_hmac, access: mv_has_access}, '*');
			window.opener.parent.postMessage({sessionid: mv_session_id, hmac: access_hmac, access: mv_has_access}, '*');
			if (window.top === window) {
				console.log('Popup closing itself');
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
		alert('Din brugerkonto har ikke adgang til Grammateket - kontakt http://mv-nordic.com/');
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

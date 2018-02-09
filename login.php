<?php
require_once __DIR__.'/mvid_ai.php';
$mv_has_comma = comma_check_access($mv_session_id, $mvid_shared_key);

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
	<script src="<?=$mvid_url;?>/sp-js/mvlogin.js"></script>
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
mvid_url = '<?=$mvid_url;?>';
var mv_has_comma = <?=($mv_has_comma ? 'true' : 'false');?>;

$(function() {
	if (mv_has_comma) {
		document.location = './';
		return;
	}

	var sso_args = {
		mv_session_id: '<?=$mv_session_id;?>'
	}
	doSSO(sso_args, function(res) {
		if (res.app_auth_ok) {
			if (!mv_has_comma) {
				alert('Din brugerkonto har ikke adgang til Grammateket - kontakt http://mv-nordic.com/');
				return;
			}
			document.location = './';
		}
		/*
		else if (!res.mvid_auth_ok) {
			doLogin();
		}
		//*/
	});
});
</script>

</body>
</html>

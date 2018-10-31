<!DOCTYPE html>
<html lang="da">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title data-l10n="TITLE_LOGIN_ERROR">Grammateket Login Error</title>

	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
	<link rel="stylesheet" href="static/komma.css?<?=filemtime(__DIR__.'/static/komma.css');?>">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
	<script src="static/l10n.js"></script>
</head>
<body>

<div id="container">
<div id="headbar">
<div id="logo">
	<div id="logo-back">
		<div id="logo-back-left"></div>
		<a href="./"><span class="icon icon-logo"></span><span>Grammateket</span></a>
		<div id="logo-back-right"></div>
	</div>
</div>
</div>

<div id="content">
<div id="login">
<b>
<?php
if (!empty($_REQUEST['error_message'])) {
	echo htmlspecialchars($_REQUEST['error_message']);
}
?>
</b>
<br>
<a href="./login.php">MV-ID Login</a>
</div>
</div>

<div id="footbar">
<div id="footer">
<a data-l10n-href="HREF_MV_PRIVACY" href="https://www.mv-nordic.com/dk/privatlivspolitik" data-l10n="LBL_PRIVACY">Privatlivspolitik</a>
&nbsp; - &nbsp;
<a href="https://grammarsoft.com/" data-l10n="LBL_COPYRIGHT">© 2017 GrammarSoft ApS</a>
&nbsp; - &nbsp;
<a href="https://www.mv-nordic.com/" data-l10n="LBL_DISTRIBUTED">Distribueret af MV-Nordic</a>
</div>
</div>

</div>

</body>
</html>

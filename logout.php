<?php
setcookie('mv-session-id', '', time() + 86400, '/', '', true);
setcookie('access-hmac', '', time() + 86400, '/', '', true);
?>
<!DOCTYPE html>
<html lang="da">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Grammateket Logout</title>

	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Oswald:300,700|Open+Sans:400,300">
	<link rel="stylesheet" href="static/login.css?<?=filemtime(__DIR__.'/static/login.css');?>">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
</head>
<body>

<div class="midmid"><div>Du er nu logget ud og kan lukke dette vindue.</div></div>

<script type="text/javascript">
$(function() {
	window.close();
});
</script>

</body>
</html>

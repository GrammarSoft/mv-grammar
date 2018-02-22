<?php
require_once __DIR__.'/mvid_ai.php';
$mv_has_access = mvid_check_access($GLOBALS['mv-session-id']);
if (!$mv_has_access) {
	header('Location: ./login.php');
	die();
}

function file2attr($f) {
	$t = file_get_contents($f);
	$t = preg_replace('~\n+~s', '', $t);
	$t = preg_replace('~\s+~s', ' ', $t);
	$t = htmlspecialchars($t);
	return $t;
}

?>
<!DOCTYPE html>
<html lang="da" prefix="og: http://ogp.me/ns#">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="author" content="GrammarSoft ApS">
	<meta name="keywords" content="grammatikontrol, stavekontrol, retskrivning, grammatik, stavning">
	<meta name="description" content="Få orden i grammatikken med dette værktøj">
	<meta property="og:locale" content="da_DK">
	<title>Grammateket - Avanceret stave- og grammatikkontrol</title>

	<script src="https://cdn.tinymce.com/4.3/tinymce.min.js"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>

	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

	<link rel="stylesheet" href="static/komma.css?v=30634b63">
	<script src="static/komma.js?v=cf0c8133"></script>

<script>
var sid = <?=json_encode_num($GLOBALS['mv-session-id']);?>;
var mvid_to = null;
var mvid_errs = 0;
var mvid_first = true;

var mvid_ka = null;
function mvid_keepalive_at(msec) {
	if (mvid_ka) {
		clearTimeout(mvid_ka);
	}
	mvid_ka = setTimeout(mvid_keepalive, msec);
}

function mvid_error() {
	++mvid_errs;
	console.log(mvid_errs);
	if (mvid_first) {
		document.location = './login.php';
		return;
	}
	if (mvid_errs > 3) {
		alert('Kunne ikke få forbindelse til MV-Nordic MV-ID login efter mange forsøg - gem dit arbejde og genindlæs siden.');
		return;
	}
	mvid_keepalive_at(3000);
}

function mvid_keepalive() {
	if (mvid_to) {
		clearTimeout(mvid_to);
	}
	mvid_to = setTimeout(mvid_error, mvid_first ? 2500 : 5000);

	$.post('./callback.php', {a: 'keepalive', SessionID: sid}).done(function(rv) {
		console.log(rv);
		if (!rv.hmac) {
			document.location = './login.php';
			return;
		}
		g_access = rv;
		sid = rv.sessionid;
		clearTimeout(mvid_to);
		mvid_to = null;
		mvid_errs = 0;
		mvid_first = false;
		// Keepalive 5 minutes
		mvid_keepalive_at(5*60*1000);
	}).fail(mvid_error);
}
</script>
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
<div id="warning" class="alert alert-warning"></div>
<div id="editor">
<div id="ed-head">
<span class="button button-blue" id="btn-check"><span class="icon icon-check"></span><span class="text">Tjek teksten</span></span>
<span class="button button-yellow" id="btn-correct-all"><span class="icon icon-approve-all"></span><span class="text">Godkend alle gule</span></span>
<span tabindex="0" class="button button-blue" id="btn-options" data-toggle="popover" data-trigger="manual" data-content="&lt;!--&lt;h4&gt;Fejltyper&lt;/h4&gt;&lt;ul&gt; &lt;li&gt;&lt;label&gt;&lt;input type=&quot;checkbox&quot; id=&quot;opt_onlyConfident&quot;&gt; Vis kun sikre fejl&lt;/label&gt;&lt;/li&gt; &lt;li&gt;&lt;label&gt;&lt;input type=&quot;checkbox&quot; id=&quot;opt_ignUnknown&quot;&gt; Kritiser ikke ukendte ord&lt;/label&gt; &lt;ul&gt; &lt;li&gt;&lt;label&gt;&lt;input type=&quot;checkbox&quot; id=&quot;opt_ignUNames&quot;&gt; Kritiser ikke ukendte navne&lt;/label&gt;&lt;/li&gt; &lt;li&gt;&lt;label&gt;&lt;input type=&quot;checkbox&quot; id=&quot;opt_ignUComp&quot;&gt; Kritiser ikke ukendte komposita&lt;/label&gt;&lt;/li&gt; &lt;li&gt;&lt;label&gt;&lt;input type=&quot;checkbox&quot; id=&quot;opt_ignUAbbr&quot;&gt; Kritiser ikke ukendte forkortelser&lt;/label&gt;&lt;/li&gt; &lt;li&gt;&lt;label&gt;&lt;input type=&quot;checkbox&quot; id=&quot;opt_ignUOther&quot;&gt; Kritiser ikke andre ukendte ord&lt;/label&gt;&lt;/li&gt; &lt;/ul&gt; &lt;/li&gt; &lt;li&gt;&lt;label&gt;&lt;input type=&quot;checkbox&quot; id=&quot;opt_ignMaj&quot;&gt; Kritiser ikke majuskel/minuskel-fejl&lt;/label&gt;&lt;/li&gt;&lt;/ul&gt;--&gt;&lt;h4&gt;Visning&lt;/h4&gt;&lt;ul&gt; &lt;li&gt;&lt;label&gt;&lt;input type=&quot;checkbox&quot; id=&quot;opt_color&quot;&gt; Farveblind/alternativ visning&lt;/label&gt;&lt;/li&gt;&lt;/ul&gt;&lt;h4&gt;Brugerordbog&lt;/h4&gt;&lt;ul&gt; &lt;li&gt;&lt;label&gt;&lt;input type=&quot;checkbox&quot; id=&quot;opt_useDictionary&quot;&gt; Brug din ordbog&lt;/label&gt; &amp;nbsp; &lt;button type=&quot;button&quot; class=&quot;btn btn-sm btn-info&quot; id=&quot;btn-userdict-edit&quot; onclick=&quot;showUserdictEditor(); return false;&quot;&gt;Rediger din ordbog&lt;/button&gt;&lt;/li&gt;&lt;/ul&gt;&lt;button type=&quot;button&quot; class=&quot;btn btn-primary&quot; id=&quot;btn-options-close&quot;&gt;Luk&lt;/button&gt;" data-html="true" data-placement="bottom auto"><span class="icon icon-settings"></span><span class="text">Indstillinger</span></span>
<span tabindex="0" class="button button-blue button-small" id="btn-menu" data-toggle="popover" data-trigger="focus" data-content="&lt;a href=&quot;#&quot;&gt;&lt;span class=&quot;icon icon-info&quot;&gt;&lt;/span&gt;&lt;span&gt;Information&lt;/span&gt;&lt;/a&gt;&lt;br&gt;&lt;a href=&quot;#&quot;&gt;&lt;span class=&quot;icon icon-inspire&quot;&gt;&lt;/span&gt;&lt;span&gt;Inspiration til undervisningen&lt;/span&gt;&lt;/a&gt;&lt;br&gt;&lt;a href=&quot;#&quot; onclick=&quot;$('.mce-toolbar-grp').show(); onResize(); return false;&quot;&gt;&lt;span class=&quot;icon icon-format&quot;&gt;&lt;/span&gt;&lt;span&gt;Formatering af teksten&lt;/span&gt;&lt;/a&gt;&lt;br&gt;" data-html="true" data-placement="bottom auto"><span class="icon icon-menu"></span><span class="text">Mere</span></span>
</div>
<textarea placeholder="… indsæt eller skriv din tekst her …">
</textarea>
<div id="ed-foot">
<span class="button button-yellow" id="btn-close"><span class="icon icon-ignore"></span><span class="text">Genoptag skrivning</span></span>
<span class="button button-blue" id="btn-copy"><span class="icon icon-copy"></span><span class="text">Kopier teksten</span></span>
<!--
<span class="button button-green" id="btn-transfer"><span class="icon icon-transfer"></span><span class="text">Skift til Kommaforslag</span></span>
-->
<span class="button button-red" id="btn-erase"><span class="icon icon-delete-all"></span><span class="text">Slet al tekst</span></span>
</div>
</div>
</div>

<div id="footbar">
<div id="footer">
<a href="https://www.mv-nordic.com/dk/privatlivspolitik">Privatlivspolitik</a>
&nbsp; - &nbsp;
<a href="https://grammarsoft.com/">© 2017 GrammarSoft ApS</a>
&nbsp; - &nbsp;
<a href="https://www.mv-nordic.com/">Distribueret af MV-Nordic</a>
</div>
</div>

</div>

<div class="modal fade" id="dg_userdict" tabindex="-1" role="dialog">
	<div class="modal-dialog" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h1>Rediger din ordbog</h1>
			</div>
			<div class="modal-body">
				<div id="do_userdict_entries" class="container-fluid"></div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-default" data-dismiss="modal">Luk</button>
			</div>
		</div>
	</div>
</div>

<div class="modal fade" id="dg_input" tabindex="-1" role="dialog">
	<div class="modal-dialog modal-sm" role="document">
		<div class="modal-content">
			<div class="modal-body">
				<div class="form-group">
					<label for="do_input_text">Ret selv ordet:</label>
					<input class="form-control" id="do_input_text" type="text" value=""><br>
				</div>
				<button class="btn btn-default" data-dismiss="modal">Luk</button>
				<button class="btn btn-default" id="do_input_one">Ret</button>
				<button class="btn btn-default" id="do_input_all">Ret alle</button>
			</div>
		</div>
	</div>
</div>

<div id="working">… arbejder, vent lidt …</div>

<form id="transfer" action="http://kommaforslag.mv-nordic.com/" method="post">
<input type="text" name="body" value="">
</form>

<script>
  ga = null;
<?php
if (!empty($GLOBALS['-config']['GOOGLE_AID'])) {
	echo <<<XOUT
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', '{$GLOBALS['-config']['GOOGLE_AID']}', 'auto');
  ga('send', 'pageview');
XOUT;
}
?>

mvid_keepalive_at(1000);
</script>
</body>
</html>

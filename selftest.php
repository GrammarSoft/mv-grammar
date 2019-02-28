<?php

ob_start();
require_once __DIR__.'/config.php';
if (empty($_REQUEST['key']) || $_REQUEST['key'] !== $GLOBALS['-config']['DEBUG_KEY']) {
	header('HTTP/1.1 403 DDoS Protection');
	die();
}

// Assume everything is going to hell, until we can prove otherwise
header('HTTP/1.1 500 Failed Selftest');
header('Content-Type: text/plain; charset=UTF-8');

function debug_run($host, $port, $tests) {
	$start = microtime(true);

	$k = array_rand($tests);

	$s = fsockopen($host, $port);
	fwrite($s, $k."\n<END-OF-INPUT>\n");
	$out = stream_get_contents($s);
	$out = preg_replace('~[ \t]+\n~', "\n", $out);
	$out = trim($out);

	$stop = round(microtime(true) - $start, 3);
	if ($out === $tests[$k]) {
		echo "Selftest passed ({$stop}s)\n\n";
		return true;
	}

	echo "Selftest failed ({$stop}s): '{$out}' !== '{$tests[$k]}'\n\n";
	return false;
}

function debug_dan() {
	$tests = [
		"<s1>\nEn rød hus.\n</s1>" => "<s1>
En	<R:et> @error
rød	<R:rødt> @neu
hus
.
</s1>",
		"<s1>\nEt rød bil.\n</s1>" => "<s1>
Et	<R:En> @utr
rød
bil
.
</s1>",
		"<s1>\nDet røde bil.\n</s1>" => "<s1>
Det	<R:Den> @utr
røde
bil
.
</s1>",
	];

	return debug_run($GLOBALS['-config']['GRAMMAR_DA_HOST'], $GLOBALS['-config']['GRAMMAR_DA_PORT'], $tests);
}

function debug_nob() {
	$tests = [
		"Det overaskende blå brevet." => "Det
overaskende	@R-SPELL <R:overraskende>
blå
brevet
.",
		"Den overaskende blå brevet." => "Den
overaskende	@R-SPELL <R:overraskende>
blå
brevet
.",
	];

	return debug_run($GLOBALS['-config']['GRAMMAR_NB_HOST'], $GLOBALS['-config']['GRAMMAR_NB_PORT'], $tests);
}

function debug_swe() {
	$tests = [
		"vart kommer den ifrån?" => "vart	@R-LowerCase @R550 <R:var> @R600 <R:var>
kommer
den
ifrån
?",
		"Vart kommer den ifrån?" => "Vart	@R550 <R:var> @R600 <R:var>
kommer
den
ifrån
?",
	];

	return debug_run($GLOBALS['-config']['GRAMMAR_SV_HOST'], $GLOBALS['-config']['GRAMMAR_SV_PORT'], $tests);
}

// & on purpose, because && would short-circuit which we don't want
if (debug_dan() & debug_nob() & debug_swe()) {
	header('HTTP/1.1 200 OK');
}

<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at commit 586fc7984ddf0fb9f7c5cdcf097cbad069aed2f1 (r151) deployed on 2018-02-26 13:33:16\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

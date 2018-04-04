<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at commit 48bcfe3e5ee2651f2f61e1a6bc6e7b8b03107dd9 (r154) deployed on 2018-04-04 10:14:37\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

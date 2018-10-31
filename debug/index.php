<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at r426 committed on 2018-10-31 10:39:46\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

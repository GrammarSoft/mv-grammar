<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at r451 committed on 2020-10-29 15:23:49\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

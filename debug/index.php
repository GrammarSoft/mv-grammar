<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at r438 committed on 2019-03-20 10:03:45\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

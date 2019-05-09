<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at r440 committed on 2019-05-09 10:31:20\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

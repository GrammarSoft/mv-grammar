<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at r449 committed on 2020-10-02 12:04:24\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

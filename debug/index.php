<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at commit e083ea3a0dd7da6817bfcefb818e00c1e23a712c (r152) deployed on 2018-03-21 09:21:20\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

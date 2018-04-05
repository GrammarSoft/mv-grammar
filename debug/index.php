<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at commit 9bb52d1542eadba26b77132b8248ec60acbe0d3c (r158) deployed on 2018-04-05 12:01:21\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

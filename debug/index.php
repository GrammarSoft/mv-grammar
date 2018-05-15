<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at commit fcc697e10e185efc59d7ba478f6f801f2890f1bb (r160) deployed on 2018-05-15 10:16:37\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

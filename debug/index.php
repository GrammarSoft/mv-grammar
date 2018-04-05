<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at commit f672b6eda2e31ac40b4627337950dfd9e6c8e94a (r157) deployed on 2018-04-05 10:13:54\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

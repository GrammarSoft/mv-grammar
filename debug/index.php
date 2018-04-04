<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at commit e85866c25401c13ec0b0a599ae190a34e7143c88 (r153) deployed on 2018-04-04 09:26:38\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

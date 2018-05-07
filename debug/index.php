<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at commit 82cb949c30b015d7cdea38b5f6b4941fe9ede776 (r159) deployed on 2018-05-07 16:01:15\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammatikforslag at commit 270b21aa89cfdd8a27ab7db548236bffc05b24b8 (r142) deployed on 2017-07-06 11:42:02\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

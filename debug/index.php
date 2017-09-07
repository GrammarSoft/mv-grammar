<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammatikforslag at commit 2bf1c7d57b788a9c0287777079c18ad1b96352e4 (r147) deployed on 2017-09-07 15:52:55\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at commit f325fd02e11b857d4e8166bbacc37990ea6db4de (r148) deployed on 2018-02-09 12:19:52\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

<?php

header('Content-Type: text/plain; charset=UTF-8');

echo "Grammateket at commit 86aaf427097f04f79f0b590bd3dcc60c05d78956 (r150) deployed on 2018-02-22 21:35:54\n\n";

echo "uptime:\n", shell_exec('uptime'), "\n";
echo "free -h:\n", shell_exec('free -h'), "\n";
// echo "df -h:\n", shell_exec('df -h'), "\n";

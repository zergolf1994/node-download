#!/usr/bin/env bash
set -e
localip=$(hostname -I | awk '{print $1}')
data=$(curl -sS "http://127.0.0.1:8888/download/start?sv_ip=${localip}")
status=$(echo $data | jq -r '.status')
echo "${data}"
sleep 1
exit 1
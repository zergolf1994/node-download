#!/usr/bin/env bash
set -e
[[ ! "${1}" ]] && echo "Usage: update_val.sh [slug]" && exit 1
slug=${1}
echo "update_val.sh ${slug}"
data=$(curl -sS "http://127.0.0.1:8888/status?slug=${slug}")
status=$(echo $data | jq -r '.status')

if [ $status == "false" ]
then
    echo "break 1"
    exit 1
else
    for i in {1..86400}
    do
        data2=$(curl -sS "http://127.0.0.1:8888/status?slug=${slug}")
        status2=$(echo $data2 | jq -r '.status')

        if [ $status2 == "false" ]
        then
            echo "break 2 ${i}"
            exit 1
        else
            echo "continue ${i}"
            sleep 5
        fi
    done
fi
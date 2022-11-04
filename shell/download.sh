#!/usr/bin/env bash
set -e
[[ ! "${1}" ]] && echo "Usage: download.sh [slug]" && exit 1
localip=$(hostname -I | awk '{print $1}')
rootpath="/home"
slug=${1}
linkapi="http://127.0.0.1:8888/download/data?slug=${slug}"
call_data=$(curl -sS "$linkapi")
status=$(echo $call_data | jq -r '.status')

if [[ ! "$status" ]]; then
	echo "exit"
	exit 1
fi

function urldecode() { : "${*//+/ }"; echo -e "${_//%/\\x}"; }

save_path=${rootpath}/public/${slug}

mkdir -p ${save_path}
chmod 0777 ${save_path}

title=$(echo $call_data | jq -r '.data.title')
source=$(echo $call_data | jq -r '.data.source')
type=$(echo $call_data | jq -r '.data.type')
folder=$(echo $call_data | jq -r '.data.folder')

if [ $type == "gdrive" ]
then
	#gdrive info
	gdrive_api="http://127.0.0.1:8888/gdrive/info?gid=${source}"
	gdrive_data=$(curl -sS "$gdrive_api")
	gdrive_status=$(echo $gdrive_data | jq -r '.status')
	error_code=$(echo $gdrive_data | jq -r '.errorcode')

	

	if [[  $gdrive_status == "false" ]]; then

		err_api="http://127.0.0.1:8888/download/error?slug=${slug}&e_code=${error_code}&sv_ip=${localip}"
		curl -sS "${err_api}"
		sleep 2
		curl -sS "http://127.0.0.1:8888/download/start?sv_ip=${localip}"
		echo "exit"
		exit 1
	fi

	gdrive_name=$(echo $gdrive_data | jq -r '.data.Name')
	gdrive_ext=$(echo $gdrive_data | jq -r '.data.ext')

	tmp_file=${save_path}/${gdrive_name}
	tmp_download=${save_path}/download.txt
	tmp_upload=${save_path}/upload.txt
	file_save=${save_path}/${slug}.${gdrive_ext}
else
	ext=$(echo $call_data | jq -r '.data.ext')
	speed=$(echo $call_data | jq -r '.data.speed')
	tmp_file=${save_path}/${slug}.${ext}
	tmp_download=${save_path}/download.txt
	tmp_upload=${save_path}/upload.txt
	file_save=${save_path}/${slug}.${ext}

fi

	if [[ -f "$tmp_download" ]]; then
		rm -rf ${tmp_download}
	fi
	if [[ -f "$tmp_upload" ]]; then
		rm -rf ${tmp_upload}
	fi
	if [[ -f "$tmp_file" ]]; then
		rm -rf ${tmp_file}
	fi
	if [[ -f "$file_save" ]]; then
		rm -rf ${file_save}
	fi

if [ $type == "gdrive" ]
then

    cd ${save_path} && sudo -u root gdrive download ${source} >> ${tmp_download} 2>&1
    cd 
    sleep 3
	curl -sS "http://127.0.0.1:8888/rename?slug=${slug}&gid=${source}"
   	sleep 3
    #mv "${save_path}/'${gdrive_name}'" "${file_save}"
else
    axel -n ${speed} -o "${tmp_file}" "${source}" >> ${tmp_download} 2>&1
fi
sudo -u root gdrive upload --parent ${folder} ${file_save} >> ${tmp_upload} 2>&1
sleep 3
curl -sS "http://127.0.0.1:8888/download/done?slug=${slug}"
sleep 3
rm -rf ${save_path}
sleep 2
curl -sS "http://127.0.0.1:8888/download/start?sv_ip=${localip}"
exit 1
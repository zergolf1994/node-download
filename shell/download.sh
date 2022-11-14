#!/usr/bin/env bash
set -e
[[ ! "${1}" ]] && echo "Usage: download.sh [slug]" && exit 1
localip=$(hostname -I | awk '{print $1}')
rootpath="/home/node-download-master"
slug=${1}
linkapi="http://127.0.0.1:8888/download/data?slug=${slug}"
call_data=$(curl -sS "$linkapi")
status=$(echo $call_data | jq -r '.status')

if [[ ! "$status" ]]; then
	echo "${slug} Download Error"
	curl -sS "http://127.0.0.1:8888/download/error?slug=${slug}"
	exit 1
fi

function urldecode() { : "${*//+/ }"; echo -e "${_//%/\\x}"; }

save_path=${rootpath}/public/${slug}

sudo mkdir -p ${save_path}

title=$(echo $call_data | jq -r '.title')
source=$(echo $call_data | jq -r '.source')
type=$(echo $call_data | jq -r '.type')
folder=$(echo $call_data | jq -r '.folder')

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
	tmp_download=${save_path}/dl_${slug}.txt
	tmp_upload=${save_path}/up_${slug}.txt
	file_save=${save_path}/${slug}.${gdrive_ext}
else
	ext=$(echo $call_data | jq -r '.ext')
	speed=$(echo $call_data | jq -r '.speed')
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

	echo "${slug} Download Gdrive"
	#wget --load-cookies ${save_path}/cookies.txt "https://docs.google.com/uc?export=download&confirm=$(wget --quiet --save-cookies /tmp/cookies.txt --keep-session-cookies --no-check-certificate 'https://docs.google.com/uc?export=download&id=${source}' -O- | sed -rn 's/.*confirm=([0-9A-Za-z_]+).*/\1\n/p')&id=${source}" -O ${file_save} >> ${tmp_download} 2>&1
	#rm -rf ${save_path}/cookies.txt

	#if [ -f "$file_save" ]; then
	#	echo "${slug} Download Gdrive Done"
	#else 
	#	echo "${slug} Redownload Download Gdrive"
    	cd ${save_path} && sudo -u root gdrive download ${source} >> ${tmp_download} 2>&1
		sleep 2
		curl -sS "http://127.0.0.1:8888/rename?slug=${slug}&gid=${source}"
		sleep 1
	#fi

	#เช็คไฟล์ download
else
	echo "${slug} Download Direct"
    axel -n ${speed} -o "${tmp_file}" "${source}" >> ${tmp_download} 2>&1
fi

check_api="http://127.0.0.1:8888/download/check?slug=${slug}"
check_data=$(curl -sS "$check_api")
check_status=$(echo $check_data | jq -r '.status')
check_msg=$(echo $gdrive_data | jq -r '.msg')

if [ $check_status == "false" ]
then
	echo "${slug} ${check_msg}"
	err_api="http://127.0.0.1:8888/download/error?slug=${slug}&e_code=${error_code}&sv_ip=${localip}"
	curl -sS "${err_api}"
	sleep 2
	curl -sS "http://127.0.0.1:8888/download/start?sv_ip=${localip}"
	echo "exit"
	exit 1
else
	sleep 1
	echo "${slug} Upload Gdrive"
	sudo -u root gdrive upload --parent ${folder} ${file_save} >> ${tmp_upload} 2>&1
	sleep 2
	echo "${slug} Save Backup"
	curl -sS "http://127.0.0.1:8888/download/backup?slug=${slug}&quality=default&sv_ip=${localip}"
	sleep 2
	echo "${slug} Done"
	curl -sS "http://127.0.0.1:8888/download/done?slug=${slug}"
	sleep 3
	rm -rf ${save_path}
	sleep 2
fi
#curl -sS "http://127.0.0.1:8888/download/start?sv_ip=${localip}"
exit 1
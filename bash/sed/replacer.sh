#!/usr/bin/env bash

set -e
set -u

INPUT_FILE=$1
ENV_FILE=$2

REPLACE_STRING=""
while IFS="" read -r LINE || [[ -n "$LINE" ]]; do
    ENV_KEY="$(cut -d"=" -f1 <<<"$LINE")"
    ENV_VALUE="$(cut -d"=" -f2 <<<"$LINE")"
    REPLACE_STRING+="s|%$ENV_KEY%|$ENV_VALUE|g;"
done < $ENV_FILE

REPLACE_STRING=$(echo $REPLACE_STRING | sed 's/.$//')
sed -i $REPLACE_STRING $INPUT_FILE

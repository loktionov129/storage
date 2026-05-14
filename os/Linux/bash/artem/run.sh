#!/usr/bin/env bash

set -e
set -u

PATH_TO_FILES="./app/"
PATH_TO_CONFIGS="./configs/"
PATH_TO_CONFIGS_DEFAULT="./configs_default/"

FILE_EXT_TO_CUT=".sh"
FILE_EXT_FOR_CONFIGS=".json"


for FILE_NAME in $(ls -d "$PATH_TO_FILES"* | sed "s|\\"$FILE_EXT_TO_CUT"$||;s|"$PATH_TO_FILES"||"); do
    FULL_PATH_TO_CONFIG="$PATH_TO_CONFIGS""$FILE_NAME""$FILE_EXT_FOR_CONFIGS"

    if [ ! -f $FULL_PATH_TO_CONFIG ]; then
        FULL_PATH_TO_CONFIG="$PATH_TO_CONFIGS_DEFAULT""$FILE_NAME""$FILE_EXT_FOR_CONFIGS"
    fi 

    bash "$PATH_TO_FILES""$FILE_NAME""$FILE_EXT_TO_CUT" "$FULL_PATH_TO_CONFIG"
done

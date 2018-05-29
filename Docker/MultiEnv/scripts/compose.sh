#!/usr/bin/env bash

ENV=${1:-dev}

#ln -sf $(pwd)/docker/docker-compose.$ENV.yml $(pwd)/docker/docker-compose.override.yml
#(cd ./docker/ && docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d)

(cd ./docker/ && docker-compose up -d)

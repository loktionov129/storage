#!/usr/bin/env bash

IMAGE=${1:-myappnamenginx}

ln -sf $(pwd)/docker/$IMAGE/.dockerignore $(pwd)/.dockerignore

docker build -t $IMAGE -f ./docker/$IMAGE/Dockerfile .

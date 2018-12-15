#!/usr/bin/env bash

ENV=${1:-dev}

(cd ./docker/ && docker-compose -f docker-compose.$ENV.yml up -d)


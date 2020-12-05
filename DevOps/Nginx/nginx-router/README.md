#!/usr/bin/env bash

echo "
127.0.0.1 f
127.0.0.1 b
127.0.0.1 front.local
127.0.0.1 back.local
" >> /etc/hosts


echo "
docker build -f Dockerfile -t nginx-router .
docker run --rm --name nginx-router -d -p 80:8080 nginx-router
"
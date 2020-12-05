0. docker-compose
```
docker-compose -f docker-compose.prod.yml -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from test
```

1. .dockerignore позволяет сократить размер образа

2. часто изменяемые слои нужно ставить после редко изменяемых (например установка пакетов должна быть раньше, чем копирование исходного кода приложения)

3. очистка кеша после установки пакетов и подчищение временных папок /tmp, /var/tmp
```
# debian:
rm -rf /var/lib/apt/lists/*

# alpine:
apk add --no-cache PACKAGE_NAME
```

4. указывать явно тег базового образа в слое FROM
`FROM alpine:3.12.1`

5. указывать явно версии пакетов при установке

6. выносить версии пакетов в слой ENV для удобства
```
ENV NGINX_VERSION 1.18.0-r1
RUN apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.12/main nginx=${NGINX_VERSION} \
        && mkdir /run/nginx
```

7. использовать кеш при сборке на ci с помощью docker build --cache-from
```
docker pull $IMAGE_NAME:latest || true
docker build --cache-from $IMAGE_NAME:latest -t $IMAGE_NAME:$CI_COMMIT_SHA -t $IMAGE_NAME:latest .
$IMAGE_NAME:$CI_COMMIT_SHA
docker push $IMAGE_NAME:latest
```

8. использовать multi-stage builds, в которых начальный образ содержит sdk для сборки приложения, а финальный образ содержит runtime для запуска приложения (если для запуска приложения не нужен runtime, то можно финальный образ создать на основе scratch образа)

9. помнить, что 1 процесс - 1 контейнер



```
# Sample Dockerfile

FROM alpine:3.12.1
EXPOSE 80
ENV     NGINX_VERSION=1.18.0-r1 \
        ERKER=42 \
        EMLAK=10
RUN     set -ex && \
        apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.12/main nginx=${NGINX_VERSION} && \
        mkdir /run/nginx
RUN echo ${ERKER} __ ${EMLAK}
CMD ["nginx", "-g", "daemon off;"]
```

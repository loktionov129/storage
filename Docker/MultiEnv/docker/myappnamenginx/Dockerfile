# Stage 0, based on Node.js, to build and compile app
FROM node:latest AS myappnamenode
WORKDIR /app
#COPY package.json /app/
#RUN npm install
COPY ./ /app/
#ARG env=prod
#RUN npm run build -- --prod --environment $env
####this layer simulate the build of app
RUN ls -lah && mkdir ./build && cp ./src/index.html ./build/ && cp ./src/styles.css ./build/ && ls -lah && ls -lah ./src

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx AS myappnamenginx
COPY --from=myappnamenode /app/build/ /usr/share/nginx/html
COPY --from=myappnamenode /app/docker/myappnamenginx/rootfs /
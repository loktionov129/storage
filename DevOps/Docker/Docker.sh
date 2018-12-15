docker build

docker run -d --rm -v '/C/projects/wptest':'/www' -p 8081:8081 caskill
docker run --rm --hostname localhost -p 8080:8080 --name browserclient mpgp129/browserclient:latest

docker ps
docker ps -a

docker exec -it 2614dc047f79 bash

# http://192.168.99.100:8081/

docker rm `docker ps -a -q`
docker rmi `docker images -a -q`

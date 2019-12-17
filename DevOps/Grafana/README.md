# Grafana + InfluxDB

This repository is based on https://github.com/nicolargo/docker-influxdb-grafana

---

## Run

```
docker-compose up -d
```

## Create database
```
docker exec -it <influxdb_container_id> bash

$ influx -precision rfc3339
Connected to http://localhost:8086 version 1.4.x
InfluxDB shell 1.4.x

> CREATE DATABASE NOAA_water_database
> exit
```

## Import database

```
curl https://s3.amazonaws.com/noaa.water-database/NOAA_data.txt -o NOAA_data.txt
influx -import -path=NOAA_data.txt -precision=s -database=NOAA_water_database
```

## Configure grafana

Open http://localhost:3000/ and use login/pass: admin/admin

Create new DataSource http://influxdb:8086

---

Original links:

https://docs.influxdata.com/influxdb/v1.7/query_language/data_download/


https://docs.influxdata.com/chronograf/v1.7/administration/managing-influxdb-users/

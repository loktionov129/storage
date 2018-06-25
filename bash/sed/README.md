```sh
$ cat config.json
```

```JavaScript
{
    "url": "%APP_URL%",
    "log_level": "debug",
    "database": "%DB_URL%"
}
```


```sh
$ bash replacer.sh config.json .env.dev
```


```sh
$ cat config.json
```

```JavaScript
{
    "url": "http://localhost",
    "log_level": "debug",
    "database": "tcp://127.0.0.1:5432"
}
```

---

```sh
$ cat .env.dev
```

```JavaScript
APP_URL=http://localhost
DB_URL=tcp://127.0.0.1:5432
```

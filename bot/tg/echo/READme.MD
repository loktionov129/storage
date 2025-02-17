# Echo Telegram Bot
## Written in Python
### The code was taken from an article on the [habr](https://habr.com/ru/articles/709314/)
### Special thanks to @Vadim S. from comment bellow the article

0. Register your bot via @BotFather on tg
1. Create bot via replit.com
2. Set up two env vars (Secrets tab):  MY_BOT_TOKEN and MY_TG_ID
3. Add new monitor via uptimerobot.com
4. Configure it: type=http, url=YOUR_BOT_URL_FROM_REPLIT, interval=5min, alert_contact=you
5. Profit!

## Preparing your environment
```bash
py -m pip venv venv
```

## Install dependencies
```bash
# source ./venv/Scripts/activate
source ./venv/bin/activate
py -m pip install -r requirements.txt
```

## Run a program
```bash
# source ./venv/Scripts/activate
source ./venv/bin/activate
py ./main.py
```

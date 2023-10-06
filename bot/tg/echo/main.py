import myBot  # тут описана вся работа бота и в конце он запускается в отдельном потоке
from flask import Flask, request
import os
import time

app = Flask('')


@app.route('/')
def home():
  if myBot.bot_check():
    myBot.send_message(os.getenv("MY_TG_ID"), time.strftime("%Y-%m-%d %H:%M") + " - bot refreshed")
    print(time.strftime("%Y-%m-%d %H:%M") + " - get request from IP: " + request.remote_addr)
    return time.strftime("%Y-%m-%d %H:%M") + " - I'm alive and bot is checked"
  else:
    print(time.strftime("%Y-%m-%d %H:%M") +" - Problems with bot")


app.run(host='0.0.0.0', port=80)

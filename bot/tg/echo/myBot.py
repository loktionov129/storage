import telebot as tg
import threading
import os

bot = tg.TeleBot(os.getenv("MY_BOT_TOKEN"))

@bot.message_handler(content_types=['text'])
def get_text_message(message):
  print(message.from_user.id)
  bot.send_message(message.from_user.id, message.text)

def bot_check():
  return bot.get_me()

def send_message(user_id, text):
  bot.send_message(user_id, text)

def bot_runner():
  bot.infinity_polling(none_stop=True)

t = threading.Thread(target=bot_runner)
t.start()

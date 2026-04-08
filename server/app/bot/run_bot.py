from dotenv import load_dotenv
import os
import logging

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()
WEBAPP_URL = os.getenv("WEBAPP_URL", "").strip()

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN не найден в .env")
if not WEBAPP_URL:
    raise RuntimeError("WEBAPP_URL не найден в .env (должен быть https://...)")

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = InlineKeyboardMarkup(
        [
            [InlineKeyboardButton("Открыть OneLive", web_app=WebAppInfo(url=WEBAPP_URL))],
            [InlineKeyboardButton("Открыть в браузере", url=WEBAPP_URL)],
        ]
    )

    if update.message:
        await update.message.reply_text(
            "OneLive — трекер привычек, заметки и таймер.\n\n"
            "Нажми кнопку ниже, чтобы открыть Mini App:",
            reply_markup=keyboard,
        )

async def set_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Ставит кнопку Mini App в меню чата (Chat Menu Button).
    Это выглядит максимально нативно.
    """
    await context.bot.set_chat_menu_button(
        menu_button={
            "type": "web_app",
            "text": "OneLive",
            "web_app": {"url": WEBAPP_URL},
        }
    )
    if update.message:
        await update.message.reply_text("Готово: кнопка OneLive добавлена в меню чата.")

def main():
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("menu", set_menu))

    print("Бот запущен. Команды: /start, /menu")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
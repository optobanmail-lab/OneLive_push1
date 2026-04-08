import httpx
from app.core.config import settings


async def send_message(chat_id: int, text: str) -> None:
    if not settings.BOT_TOKEN:
        return
    url = f"https://api.telegram.org/bot{settings.BOT_TOKEN}/sendMessage"
    async with httpx.AsyncClient(timeout=10) as client:
        await client.post(url, json={"chat_id": chat_id, "text": text})
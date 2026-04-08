import hashlib
import hmac
from urllib.parse import parse_qsl
from sqlalchemy.orm import Session

from app.db.models.user import User


def verify_init_data(init_data: str, bot_token: str) -> bool:
    """
    Telegram Mini App initData verification:
    https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    """
    if not bot_token:
        return False

    data = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = data.pop("hash", None)
    if not received_hash:
        return False

    # Build data_check_string
    pairs = [f"{k}={v}" for k, v in sorted(data.items())]
    data_check_string = "\n".join(pairs)

    secret_key = hashlib.sha256(bot_token.encode("utf-8")).digest()
    computed_hash = hmac.new(secret_key, data_check_string.encode("utf-8"), hashlib.sha256).hexdigest()

    return hmac.compare_digest(computed_hash, received_hash)


def extract_user_from_init_data(init_data: str) -> dict | None:
    data = dict(parse_qsl(init_data, keep_blank_values=True))
    # user приходит JSON-строкой
    user_json = data.get("user")
    if not user_json:
        return None

    # Telegram присылает JSON в виде строки; FastAPI/urllib не парсит автоматически
    import json
    try:
        user = json.loads(user_json)
        return user
    except Exception:
        return None


def get_or_create_user_from_init_data(db: Session, init_data: str) -> User:
    user_data = extract_user_from_init_data(init_data)
    if not user_data:
        # теоретически может быть, но редко
        telegram_id = -1
        username = ""
        first_name = ""
        photo_url = ""
    else:
        telegram_id = int(user_data.get("id"))
        username = user_data.get("username") or ""
        first_name = user_data.get("first_name") or ""
        photo_url = user_data.get("photo_url") or ""

    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if user:
        # обновим поля, если поменялись
        user.username = username
        user.first_name = first_name
        user.photo_url = photo_url
        db.commit()
        db.refresh(user)
        return user

    user = User(
        telegram_id=telegram_id,
        username=username,
        first_name=first_name,
        photo_url=photo_url,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.db.models.user import User
from app.services.telegram_service import verify_init_data, get_or_create_user_from_init_data


INIT_DATA_HEADER = "X-Telegram-Init-Data"


def get_current_user(
        db: Session = Depends(get_db),
        x_telegram_init_data: str | None = Header(default=None, alias=INIT_DATA_HEADER),
) -> User:
    """
    Основной способ авторизации: фронт присылает Telegram.WebApp.initData
    в заголовке X-Telegram-Init-Data. Сервер проверяет подпись и выдаёт user.
    """
    if settings.DEV_BYPASS_AUTH and not x_telegram_init_data:
        # Dev режим: создаём "локального" пользователя
        user = db.query(User).filter(User.telegram_id == 0).first()
        if user:
            return user
        user = User(
            telegram_id=0,
            username="dev",
            first_name="Dev",
            photo_url="",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    if not x_telegram_init_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-Telegram-Init-Data header",
        )

    ok = verify_init_data(x_telegram_init_data, settings.BOT_TOKEN)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram initData",
        )

    user = get_or_create_user_from_init_data(db, x_telegram_init_data)
    return user
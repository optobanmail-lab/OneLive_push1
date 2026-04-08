from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.user import UserOut
from app.services.telegram_service import verify_init_data, get_or_create_user_from_init_data

router = APIRouter()


@router.post("/telegram", response_model=UserOut)
def auth_telegram(
        db: Session = Depends(get_db),
        x_telegram_init_data: str | None = Header(default=None, alias="X-Telegram-Init-Data"),
):
    if not x_telegram_init_data:
        raise HTTPException(status_code=400, detail="Missing X-Telegram-Init-Data")

    if not verify_init_data(x_telegram_init_data, settings.BOT_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid Telegram initData")

    user = get_or_create_user_from_init_data(db, x_telegram_init_data)
    return user
from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.models.user import User
from app.schemas.user import UserOut

router = APIRouter()


@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return user
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.habit import HabitCreate, HabitOut, HabitToggleOut, HabitUpdate
from app.services.habit_service import (
    list_habits,
    create_habit,
    update_habit,
    delete_habit,
    toggle_habit_day,
)

router = APIRouter()


@router.get("", response_model=list[HabitOut])
def habits_list(
        db: Session = Depends(get_db),
        user: User = Depends(get_current_user),
):
    return list_habits(db, user.id)


@router.post("", response_model=HabitOut)
def habits_create(
        payload: HabitCreate,
        db: Session = Depends(get_db),
        user: User = Depends(get_current_user),
):
    return create_habit(db, user.id, payload)


@router.patch("/{habit_id}", response_model=HabitOut)
def habits_update(
        habit_id: int,
        payload: HabitUpdate,
        db: Session = Depends(get_db),
        user: User = Depends(get_current_user),
):
    try:
        return update_habit(db, user.id, habit_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{habit_id}")
def habits_delete(
        habit_id: int,
        db: Session = Depends(get_db),
        user: User = Depends(get_current_user),
):
    delete_habit(db, user.id, habit_id)
    return {"ok": True}


@router.post("/{habit_id}/toggle", response_model=HabitToggleOut)
def habits_toggle_today(
        habit_id: int,
        db: Session = Depends(get_db),
        user: User = Depends(get_current_user),
):
    day = date.today()
    try:
        done = toggle_habit_day(db, user.id, habit_id, day)
        return HabitToggleOut(habit_id=habit_id, day=str(day), done=done)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
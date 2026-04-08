from datetime import date
from sqlalchemy.orm import Session

from app.db.models.habit import Habit, HabitLog
from app.schemas.habit import HabitCreate, HabitUpdate


def list_habits(db: Session, user_id: int) -> list[Habit]:
    return (
        db.query(Habit)
        .filter(Habit.user_id == user_id)
        .order_by(Habit.id.desc())
        .all()
    )


def create_habit(db: Session, user_id: int, data: HabitCreate) -> Habit:
    habit = Habit(
        user_id=user_id,
        kind=data.kind,
        title=data.title.strip(),
        comment=data.comment or "",
        reminder_time=data.reminder_time or "",
        tag=(data.tag or "").lstrip("#"),
        archived=False,
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


def update_habit(db: Session, user_id: int, habit_id: int, data: HabitUpdate) -> Habit:
    habit = db.query(Habit).filter(Habit.user_id == user_id, Habit.id == habit_id).first()
    if not habit:
        raise ValueError("Habit not found")

    if data.title is not None:
        habit.title = data.title.strip()
    if data.comment is not None:
        habit.comment = data.comment
    if data.reminder_time is not None:
        habit.reminder_time = data.reminder_time
    if data.tag is not None:
        habit.tag = data.tag.lstrip("#")
    if data.archived is not None:
        habit.archived = data.archived

    db.commit()
    db.refresh(habit)
    return habit


def delete_habit(db: Session, user_id: int, habit_id: int) -> None:
    habit = db.query(Habit).filter(Habit.user_id == user_id, Habit.id == habit_id).first()
    if not habit:
        return

    # удалим логи
    db.query(HabitLog).filter(HabitLog.user_id == user_id, HabitLog.habit_id == habit_id).delete()
    db.delete(habit)
    db.commit()


def toggle_habit_day(db: Session, user_id: int, habit_id: int, day: date) -> bool:
    """
    True => стало выполнено, False => стало не выполнено
    """
    habit = db.query(Habit).filter(Habit.user_id == user_id, Habit.id == habit_id).first()
    if not habit:
        raise ValueError("Habit not found")

    existing = (
        db.query(HabitLog)
        .filter(HabitLog.user_id == user_id, HabitLog.habit_id == habit_id, HabitLog.day == day)
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
        return False

    log = HabitLog(user_id=user_id, habit_id=habit_id, day=day)
    db.add(log)
    db.commit()
    return True
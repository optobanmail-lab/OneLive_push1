from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.db.models.habit import Habit, HabitLog


def get_today_stats(db: Session, user_id: int) -> dict:
    today = date.today()
    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.archived == False).all()  # noqa: E712
    total = len(habits)

    done = (
        db.query(HabitLog)
        .join(Habit, Habit.id == HabitLog.habit_id)
        .filter(HabitLog.user_id == user_id, HabitLog.day == today, Habit.archived == False)  # noqa: E712
        .count()
    )

    return {"day": str(today), "total": total, "done": done}


def get_rhythm_28_days(db: Session, user_id: int) -> list[dict]:
    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.archived == False).all()  # noqa: E712
    total = len(habits)

    out = []
    for i in range(27, -1, -1):
        d = date.today() - timedelta(days=i)
        done = (
            db.query(HabitLog)
            .join(Habit, Habit.id == HabitLog.habit_id)
            .filter(HabitLog.user_id == user_id, HabitLog.day == d, Habit.archived == False)  # noqa: E712
            .count()
        )
        out.append({"day": str(d), "done": done, "total": total})
    return out
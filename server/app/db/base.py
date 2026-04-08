from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Импорт моделей, чтобы Base "увидела" таблицы
from app.db.models.user import User  # noqa: E402,F401
from app.db.models.habit import Habit, HabitLog  # noqa: E402,F401
from app.db.models.note import Note  # noqa: E402,F401
from app.db.models.timer import TimerSettings  # noqa: E402,F401
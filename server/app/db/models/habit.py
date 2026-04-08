from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Habit(Base):
    __tablename__ = "habits"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    kind: Mapped[str] = mapped_column(String(16), default="habit")  # habit | task
    title: Mapped[str] = mapped_column(String(200))
    comment: Mapped[str] = mapped_column(String(500), default="")
    reminder_time: Mapped[str] = mapped_column(String(10), default="")  # "HH:MM"
    tag: Mapped[str] = mapped_column(String(64), default="")

    archived: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    habit_id: Mapped[int] = mapped_column(ForeignKey("habits.id"), index=True)

    day: Mapped[str] = mapped_column(Date, index=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
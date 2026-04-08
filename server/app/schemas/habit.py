from pydantic import BaseModel, Field


class HabitCreate(BaseModel):
    kind: str = Field(default="habit")  # habit | task
    title: str
    comment: str = ""
    reminder_time: str = ""  # "HH:MM"
    tag: str = ""


class HabitUpdate(BaseModel):
    title: str | None = None
    comment: str | None = None
    reminder_time: str | None = None
    tag: str | None = None
    archived: bool | None = None


class HabitOut(BaseModel):
    id: int
    kind: str
    title: str
    comment: str
    reminder_time: str
    tag: str
    archived: bool

    model_config = {"from_attributes": True}


class HabitToggleOut(BaseModel):
    habit_id: int
    day: str
    done: bool
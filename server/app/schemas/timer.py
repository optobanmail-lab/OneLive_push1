from pydantic import BaseModel


class NoteCreate(BaseModel):
    title: str = ""
    content: str = ""
    folder: str = "Inbox"


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    folder: str | None = None


class NoteOut(BaseModel):
    id: int
    title: str
    content: str
    folder: str

    model_config = {"from_attributes": True}
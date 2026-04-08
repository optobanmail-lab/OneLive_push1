from sqlalchemy.orm import Session
from app.db.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


def list_notes(db: Session, user_id: int) -> list[Note]:
    return (
        db.query(Note)
        .filter(Note.user_id == user_id)
        .order_by(Note.id.desc())
        .all()
    )


def create_note(db: Session, user_id: int, data: NoteCreate) -> Note:
    note = Note(
        user_id=user_id,
        title=data.title or "",
        content=data.content or "",
        folder=data.folder or "Inbox",
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def update_note(db: Session, user_id: int, note_id: int, data: NoteUpdate) -> Note:
    note = db.query(Note).filter(Note.user_id == user_id, Note.id == note_id).first()
    if not note:
        raise ValueError("Note not found")

    if data.title is not None:
        note.title = data.title
    if data.content is not None:
        note.content = data.content
    if data.folder is not None:
        note.folder = data.folder

    db.commit()
    db.refresh(note)
    return note


def delete_note(db: Session, user_id: int, note_id: int) -> None:
    note = db.query(Note).filter(Note.user_id == user_id, Note.id == note_id).first()
    if not note:
        return
    db.delete(note)
    db.commit()
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.note import NoteCreate, NoteOut, NoteUpdate
from app.services.note_service import list_notes, create_note, update_note, delete_note

router = APIRouter()


@router.get("", response_model=list[NoteOut])
def notes_list(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return list_notes(db, user.id)


@router.post("", response_model=NoteOut)
def notes_create(payload: NoteCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return create_note(db, user.id, payload)


@router.patch("/{note_id}", response_model=NoteOut)
def notes_update(note_id: int, payload: NoteUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        return update_note(db, user.id, note_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{note_id}")
def notes_delete(note_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    delete_note(db, user.id, note_id)
    return {"ok": True}
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.reader import ReadingProgress, Highlight, Note
from app.schemas.reader import ProgressUpdate, ReadingProgressOut, HighlightCreate, HighlightOut, NoteCreate, NoteOut
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/reader", tags=["Online Reader & Study Mode"])

@router.post("/progress", response_model=ReadingProgressOut)
def save_reading_progress(prog_in: ProgressUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prog = db.query(ReadingProgress).filter(
        ReadingProgress.user_id == current_user.id,
        ReadingProgress.book_id == prog_in.book_id
    ).first()

    if not prog:
        prog = ReadingProgress(
            user_id=current_user.id,
            book_id=prog_in.book_id,
            last_chapter_id=prog_in.chapter_id,
            position_percent=prog_in.position_percent
        )
        db.add(prog)
    else:
        prog.last_chapter_id = prog_in.chapter_id
        prog.position_percent = prog_in.position_percent

    db.commit()
    db.refresh(prog)
    return prog


@router.get("/progress/{book_id}", response_model=ReadingProgressOut)
def get_reading_progress(book_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prog = db.query(ReadingProgress).filter(
        ReadingProgress.user_id == current_user.id,
        ReadingProgress.book_id == book_id
    ).first()
    if not prog:
        return ReadingProgressOut(
            id=0,
            user_id=current_user.id,
            book_id=book_id,
            last_chapter_id=None,
            position_percent=0.0,
            last_read_at=None
        )
    return prog


@router.post("/highlights", response_model=HighlightOut)
def create_highlight(hl_in: HighlightCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    hl = Highlight(
        user_id=current_user.id,
        book_id=hl_in.book_id,
        chapter_id=hl_in.chapter_id,
        selected_text=hl_in.selected_text,
        color=hl_in.color
    )
    db.add(hl)
    db.commit()
    db.refresh(hl)
    return hl


@router.get("/highlights/{book_id}", response_model=List[HighlightOut])
def get_highlights(book_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Highlight).filter(Highlight.user_id == current_user.id, Highlight.book_id == book_id).all()


@router.post("/notes", response_model=NoteOut)
def create_note(note_in: NoteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = Note(
        user_id=current_user.id,
        book_id=note_in.book_id,
        chapter_id=note_in.chapter_id,
        highlight_id=note_in.highlight_id,
        content=note_in.content
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/notes/{book_id}", response_model=List[NoteOut])
def get_notes(book_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Note).filter(Note.user_id == current_user.id, Note.book_id == book_id).all()

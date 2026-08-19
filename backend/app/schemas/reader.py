from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProgressUpdate(BaseModel):
    book_id: int
    chapter_id: int
    position_percent: float

class ReadingProgressOut(BaseModel):
    id: int
    user_id: int
    book_id: int
    last_chapter_id: Optional[int]
    position_percent: float
    last_read_at: datetime

    class Config:
        from_attributes = True

class HighlightCreate(BaseModel):
    book_id: int
    chapter_id: Optional[int] = None
    selected_text: str
    color: str = "yellow"

class HighlightOut(BaseModel):
    id: int
    user_id: int
    book_id: int
    chapter_id: Optional[int]
    selected_text: str
    color: str
    created_at: datetime

    class Config:
        from_attributes = True

class NoteCreate(BaseModel):
    book_id: int
    chapter_id: Optional[int] = None
    highlight_id: Optional[int] = None
    content: str

class NoteOut(BaseModel):
    id: int
    user_id: int
    book_id: int
    chapter_id: Optional[int]
    highlight_id: Optional[int]
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

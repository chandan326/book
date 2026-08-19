from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class SubsectionCreate(BaseModel):
    title: str
    content: str = ""
    order_index: int = 0

class SubsectionOut(BaseModel):
    id: int
    title: str
    content: str
    order_index: int

    class Config:
        from_attributes = True

class SectionCreate(BaseModel):
    title: str
    content: str = ""
    order_index: int = 0
    subsections: Optional[List[SubsectionCreate]] = []

class SectionOut(BaseModel):
    id: int
    chapter_id: int
    title: str
    content: str
    order_index: int
    subsections: List[SubsectionOut] = []

    class Config:
        from_attributes = True

class ChapterCreate(BaseModel):
    title: str
    summary: str = ""
    part_id: Optional[int] = None
    order_index: int = 0
    sections: Optional[List[SectionCreate]] = []

class ChapterOut(BaseModel):
    id: int
    book_id: int
    part_id: Optional[int] = None
    title: str
    summary: str
    order_index: int
    readability_score: float
    sections: List[SectionOut] = []

    class Config:
        from_attributes = True

class PartCreate(BaseModel):
    title: str
    order_index: int = 0

class PartOut(BaseModel):
    id: int
    book_id: int
    title: str
    order_index: int
    chapters: List[ChapterOut] = []

    class Config:
        from_attributes = True

class BookCreate(BaseModel):
    title: str
    subtitle: Optional[str] = ""
    genre: Optional[str] = "Non-fiction"
    language: Optional[str] = "English"
    target_audience: Optional[str] = "General Readers"
    writing_style: Optional[str] = "Professional & Clear"
    description: Optional[str] = ""
    formatting_preset: Optional[str] = "Non-fiction"

class BookUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    genre: Optional[str] = None
    language: Optional[str] = None
    target_audience: Optional[str] = None
    writing_style: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    cover_url: Optional[str] = None
    formatting_preset: Optional[str] = None
    front_matter_json: Optional[Dict[str, Any]] = None
    back_matter_json: Optional[Dict[str, Any]] = None
    style_guide_json: Optional[Dict[str, Any]] = None

class BookOut(BaseModel):
    id: int
    title: str
    subtitle: str
    author_id: int
    genre: str
    language: str
    target_audience: str
    writing_style: str
    description: str
    status: str
    views_count: int
    downloads_count: int
    cover_url: str
    formatting_preset: str
    front_matter_json: Dict[str, Any]
    back_matter_json: Dict[str, Any]
    style_guide_json: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    parts: List[PartOut] = []
    chapters: List[ChapterOut] = []

    class Config:
        from_attributes = True

class BookVersionOut(BaseModel):
    id: int
    book_id: int
    version_name: str
    description: str
    snapshot_data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

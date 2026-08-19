from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.book import Book, Part, Chapter, Section, Subsection, BookVersion
from app.schemas.book import BookCreate, BookUpdate, BookOut, ChapterCreate, ChapterOut, SectionCreate, SectionOut, BookVersionOut
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/books", tags=["Books"])

@router.post("/", response_model=BookOut, status_code=status.HTTP_201_CREATED)
def create_book(book_in: BookCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    book = Book(
        title=book_in.title,
        subtitle=book_in.subtitle or "",
        author_id=current_user.id,
        genre=book_in.genre or "Non-fiction",
        language=book_in.language or "English",
        target_audience=book_in.target_audience or "General Readers",
        writing_style=book_in.writing_style or "Professional & Clear",
        description=book_in.description or "",
        formatting_preset=book_in.formatting_preset or "Non-fiction",
        front_matter_json={
            "title_page": {"title": book_in.title, "author": current_user.full_name},
            "copyright_page": {"year": "2026", "rights": "All rights reserved."},
            "dedication": "",
            "preface": ""
        },
        back_matter_json={
            "acknowledgements": "",
            "about_author": current_user.bio or f"About {current_user.full_name}",
            "references": []
        },
        style_guide_json={
            "preferred_spelling": "American English",
            "tone": "Professional"
        }
    )
    db.add(book)
    db.commit()
    db.refresh(book)

    # Default initial chapter and section
    ch = Chapter(
        book_id=book.id,
        title="Chapter 1: Introduction & Foundation",
        summary="Overview of core concepts and initial premise.",
        order_index=0,
        readability_score=88.5
    )
    db.add(ch)
    db.commit()
    db.refresh(ch)

    sec = Section(
        chapter_id=ch.id,
        title="Section 1.1: Core Thesis",
        content="Welcome to your new book manuscript. Start writing here or use our AI Book Assistant to generate structure, draft chapters, or refine prose.",
        order_index=0
    )
    db.add(sec)
    db.commit()
    db.refresh(book)
    return book


@router.get("/", response_model=List[BookOut])
def get_user_books(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Book).filter(Book.author_id == current_user.id).order_by(Book.updated_at.desc()).all()


@router.get("/public", response_model=List[BookOut])
def get_public_books(db: Session = Depends(get_db)):
    return db.query(Book).filter(Book.status == "Public").order_by(Book.views_count.desc()).all()


@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: int, current_user: Optional[User] = Depends(get_current_user), db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Increment views count
    book.views_count += 1
    db.commit()
    db.refresh(book)
    return book


@router.put("/{book_id}", response_model=BookOut)
def update_book(book_id: int, book_in: BookUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id, Book.author_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found or unauthorized")

    for field, val in book_in.model_dump(exclude_unset=True).items():
        setattr(book, field, val)
    
    db.commit()
    db.refresh(book)
    return book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id, Book.author_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found or unauthorized")
    db.delete(book)
    db.commit()
    return None

# Hierarchy Chapter/Section endpoints
@router.post("/{book_id}/chapters", response_model=ChapterOut)
def add_chapter(book_id: int, ch_in: ChapterCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id, Book.author_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    ch = Chapter(
        book_id=book.id,
        part_id=ch_in.part_id,
        title=ch_in.title,
        summary=ch_in.summary or "",
        order_index=ch_in.order_index
    )
    db.add(ch)
    db.commit()
    db.refresh(ch)

    # Initial section
    sec = Section(
        chapter_id=ch.id,
        title="Section 1",
        content="Start typing content for this chapter...",
        order_index=0
    )
    db.add(sec)
    db.commit()
    db.refresh(ch)
    return ch

@router.put("/sections/{section_id}", response_model=SectionOut)
def update_section(section_id: int, sec_in: SectionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sec = db.query(Section).filter(Section.id == section_id).first()
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
    sec.title = sec_in.title
    sec.content = sec_in.content
    sec.order_index = sec_in.order_index
    db.commit()
    db.refresh(sec)
    return sec

@router.delete("/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chapter(chapter_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ch = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Chapter not found")
    book = db.query(Book).filter(Book.id == ch.book_id, Book.author_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=403, detail="Unauthorized")
    db.delete(ch)
    db.commit()
    return None

@router.post("/chapters/{chapter_id}/sections", response_model=SectionOut)
def add_section(chapter_id: int, sec_in: SectionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ch = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Chapter not found")
    book = db.query(Book).filter(Book.id == ch.book_id, Book.author_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    sec = Section(
        chapter_id=ch.id,
        title=sec_in.title or f"Section {len(ch.sections) + 1}",
        content=sec_in.content or "Start typing content for this section...",
        order_index=len(ch.sections)
    )
    db.add(sec)
    db.commit()
    db.refresh(sec)
    return sec

@router.delete("/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(section_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sec = db.query(Section).filter(Section.id == section_id).first()
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
    ch = db.query(Chapter).filter(Chapter.id == sec.chapter_id).first()
    if ch:
        book = db.query(Book).filter(Book.id == ch.book_id, Book.author_id == current_user.id).first()
        if not book:
            raise HTTPException(status_code=403, detail="Unauthorized")
    db.delete(sec)
    db.commit()
    return None

# Version Control
@router.post("/{book_id}/versions", response_model=BookVersionOut)
def create_book_version(book_id: int, version_name: str = "Version Snapshot", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id, Book.author_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    snapshot = {
        "title": book.title,
        "subtitle": book.subtitle,
        "description": book.description,
        "chapters": [
            {
                "id": c.id,
                "title": c.title,
                "sections": [{"id": s.id, "title": s.title, "content": s.content} for s in c.sections]
            } for c in book.chapters
        ]
    }

    ver = BookVersion(
        book_id=book.id,
        version_name=version_name,
        snapshot_data=snapshot
    )
    db.add(ver)
    db.commit()
    db.refresh(ver)
    return ver

@router.get("/{book_id}/versions", response_model=List[BookVersionOut])
def get_book_versions(book_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(BookVersion).filter(BookVersion.book_id == book_id).order_by(BookVersion.created_at.desc()).all()

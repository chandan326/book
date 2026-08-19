from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.book import Book
from app.services.auth_service import get_current_user
from app.services.export_service import generate_pdf_book, generate_docx_book

router = APIRouter(prefix="/export", tags=["Book Document Export"])

@router.get("/pdf/{book_id}")
def export_book_pdf(book_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    book.downloads_count += 1
    db.commit()

    book_dict = {
        "title": book.title,
        "subtitle": book.subtitle,
        "author_name": current_user.full_name or "Author",
        "genre": book.genre,
        "chapters": [
            {
                "title": c.title,
                "summary": c.summary,
                "sections": [{"title": s.title, "content": s.content} for s in c.sections]
            } for c in book.chapters
        ]
    }

    pdf_bytes = generate_pdf_book(book_dict)
    filename = f"{book.title.replace(' ', '_')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/docx/{book_id}")
def export_book_docx(book_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    book.downloads_count += 1
    db.commit()

    book_dict = {
        "title": book.title,
        "subtitle": book.subtitle,
        "author_name": current_user.full_name or "Author",
        "genre": book.genre,
        "chapters": [
            {
                "title": c.title,
                "summary": c.summary,
                "sections": [{"title": s.title, "content": s.content} for s in c.sections]
            } for c in book.chapters
        ]
    }

    docx_bytes = generate_docx_book(book_dict)
    filename = f"{book.title.replace(' ', '_')}.docx"
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

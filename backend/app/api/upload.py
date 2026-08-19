from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.book import Book, Chapter, Section
from app.models.ai_job import AIJob
from app.services.auth_service import get_current_user
from app.services.document_parser import parse_manuscript_document

router = APIRouter(prefix="/upload", tags=["Document Upload Pipeline"])

@router.post("/")
async def upload_manuscript_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    filename = file.filename or "manuscript.pdf"

    # Process extracted structured content
    extracted = parse_manuscript_document(contents, filename)

    # Create new structured Book object
    book = Book(
        title=extracted["title"],
        subtitle=extracted["subtitle"],
        author_id=current_user.id,
        genre="General",
        description=extracted["description"],
        status="Editing",
        front_matter_json={"title_page": {"title": extracted["title"], "author": current_user.full_name}},
        back_matter_json={"about_author": current_user.bio or f"About {current_user.full_name}"},
        style_guide_json={"preferred_spelling": "American English"}
    )
    db.add(book)
    db.commit()
    db.refresh(book)

    # Save extracted chapters & sections
    for ch_idx, ch_data in enumerate(extracted.get("chapters", [])):
        ch = Chapter(
            book_id=book.id,
            title=ch_data["title"],
            summary=ch_data.get("summary", ""),
            order_index=ch_idx,
            readability_score=85.0
        )
        db.add(ch)
        db.commit()
        db.refresh(ch)

        for sec_idx, sec_data in enumerate(ch_data.get("sections", [])):
            sec = Section(
                chapter_id=ch.id,
                title=sec_data["title"],
                content=sec_data.get("content", ""),
                order_index=sec_idx
            )
            db.add(sec)
    
    db.commit()

    # Track AI Job Status
    job = AIJob(
        book_id=book.id,
        job_type="document_ocr_extraction",
        status="completed",
        progress_percentage=100,
        message=f"Successfully extracted manuscript structure from {filename} into {len(extracted.get('chapters', []))} chapters."
    )
    db.add(job)
    db.commit()

    return {
        "status": "Ready",
        "message": "File successfully parsed into editable book structure.",
        "book_id": book.id,
        "title": book.title,
        "chapters_count": len(extracted.get("chapters", []))
    }

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.book import Book, Chapter, Section
from app.models.ai_job import AISuggestion
from app.schemas.ai import AISuggestionOut, AIReviewRequest, AIAssistantRequest, AIAssistantResponse
from app.services.auth_service import get_current_user
from app.services.ai_engine import AIBookEditorEngine

router = APIRouter(prefix="/ai", tags=["AI Book Editor"])

@router.post("/audit-chapter")
def audit_chapter(req: AIReviewRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == req.book_id, Book.author_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    chapter = None
    if req.chapter_id:
        chapter = db.query(Chapter).filter(Chapter.id == req.chapter_id, Chapter.book_id == book.id).first()
    if not chapter and book.chapters:
        chapter = book.chapters[0]

    if not chapter:
        raise HTTPException(status_code=400, detail="No chapters found to audit")

    # Combine section contents for analysis
    full_text = "\n\n".join([s.content for s in chapter.sections if s.content])
    audit_results = AIBookEditorEngine.audit_chapter_content(chapter.title, full_text)

    # Update chapter readability score
    chapter.readability_score = audit_results["readability_score"]
    db.commit()

    # Save suggestions to database
    saved_suggestions = []
    for sug in audit_results.get("suggestions", []):
        sec_id = chapter.sections[0].id if chapter.sections else None
        db_sug = AISuggestion(
            book_id=book.id,
            chapter_id=chapter.id,
            section_id=sec_id,
            category=sug["category"],
            original_text=sug["original_text"],
            suggested_text=sug["suggested_text"],
            explanation=sug["explanation"],
            status="pending"
        )
        db.add(db_sug)
        db.commit()
        db.refresh(db_sug)
        saved_suggestions.append(db_sug)

    return {
        "chapter_id": chapter.id,
        "chapter_title": chapter.title,
        "readability_score": chapter.readability_score,
        "problems_detected": audit_results["problems_detected"],
        "transition_recommendation": audit_results["transition_recommendation"],
        "fact_checks": audit_results["fact_checks"],
        "visual_recommendations": audit_results["visual_recommendations"],
        "suggestions": [AISuggestionOut.model_validate(s) for s in saved_suggestions]
    }


@router.get("/suggestions/{book_id}", response_model=List[AISuggestionOut])
def get_book_suggestions(book_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(AISuggestion).filter(AISuggestion.book_id == book_id, AISuggestion.status == "pending").all()


@router.post("/suggestions/{suggestion_id}/accept")
def accept_suggestion(suggestion_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sug = db.query(AISuggestion).filter(AISuggestion.id == suggestion_id).first()
    if not sug:
        raise HTTPException(status_code=404, detail="Suggestion not found")

    sug.status = "accepted"
    
    # Apply change to target section content if exists
    if sug.section_id:
        sec = db.query(Section).filter(Section.id == sug.section_id).first()
        if sec and sug.original_text in sec.content:
            sec.content = sec.content.replace(sug.original_text, sug.suggested_text)
            
    db.commit()
    return {"message": "Suggestion accepted and applied to manuscript."}


@router.post("/suggestions/{suggestion_id}/reject")
def reject_suggestion(suggestion_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sug = db.query(AISuggestion).filter(AISuggestion.id == suggestion_id).first()
    if not sug:
        raise HTTPException(status_code=404, detail="Suggestion not found")

    sug.status = "rejected"
    db.commit()
    return {"message": "Suggestion rejected."}


@router.post("/assistant-chat", response_model=AIAssistantResponse)
def assistant_chat(req: AIAssistantRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ch_title = "Active Chapter"
    if req.chapter_id:
        ch = db.query(Chapter).filter(Chapter.id == req.chapter_id).first()
        if ch:
            ch_title = ch.title

    result = AIBookEditorEngine.answer_contextual_query(
        req.user_prompt,
        req.selected_text or "",
        ch_title
    )
    return result


@router.get("/style-guide/{book_id}")
def get_style_guide(book_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if not book.style_guide_json:
        book.style_guide_json = AIBookEditorEngine.generate_book_style_guide(book.title, book.genre)
        db.commit()

    return book.style_guide_json

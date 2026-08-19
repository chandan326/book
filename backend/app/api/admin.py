from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.book import Book
from app.models.ai_job import AIJob
from app.models.publisher import Publisher
from app.models.admin import ModerationReport
from app.schemas.admin import AdminStatsOut, ModerationReportOut, ModerationReportCreate
from app.schemas.user import UserOut
from app.services.auth_service import get_current_admin, get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Dashboard & Moderation"])

@router.get("/stats", response_model=AdminStatsOut)
def get_admin_stats(admin_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_books = db.query(Book).count()
    published_books = db.query(Book).filter(Book.status == "Public").count()
    
    total_views = sum([b.views_count for b in db.query(Book).all()])
    total_downloads = sum([b.downloads_count for b in db.query(Book).all()])
    ai_jobs = db.query(AIJob).count()
    publishers = db.query(Publisher).count()

    return AdminStatsOut(
        total_users=total_users,
        total_books=total_books,
        published_books=published_books,
        total_views=total_views,
        total_downloads=total_downloads,
        ai_jobs_run=ai_jobs,
        storage_used_mb=round(total_books * 4.2, 1),
        active_publishers=publishers or 4
    )


@router.get("/users", response_model=List[UserOut])
def get_all_users(admin_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(User).all()


@router.put("/users/{user_id}/role")
def change_user_role(user_id: int, new_role: str, admin_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = new_role
    db.commit()
    return {"message": f"User {user.email} role updated to {new_role}."}


@router.post("/reports", response_model=ModerationReportOut)
def report_content(report_in: ModerationReportCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rep = ModerationReport(
        book_id=report_in.book_id,
        reporter_id=current_user.id,
        reason=report_in.reason,
        details=report_in.details
    )
    db.add(rep)
    db.commit()
    db.refresh(rep)
    return rep


@router.get("/reports", response_model=List[ModerationReportOut])
def get_moderation_reports(admin_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(ModerationReport).order_by(ModerationReport.created_at.desc()).all()

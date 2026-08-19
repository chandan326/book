from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

class ModerationReportCreate(BaseModel):
    book_id: int
    reason: str
    details: str = ""

class ModerationReportOut(BaseModel):
    id: int
    book_id: int
    reporter_id: int
    reason: str
    details: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AdminStatsOut(BaseModel):
    total_users: int
    total_books: int
    published_books: int
    total_views: int
    total_downloads: int
    ai_jobs_run: int
    storage_used_mb: float
    active_publishers: int

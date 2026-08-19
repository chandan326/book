import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from app.database import Base

class ModerationReport(Base):
    __tablename__ = "moderation_reports"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(String, nullable=False)  # copyright, abuse, spam, inappropriate
    details = Column(Text, default="")
    status = Column(String, default="pending")  # pending, resolved, dismissed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

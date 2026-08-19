import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class AISuggestion(Base):
    __tablename__ = "ai_suggestions"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    chapter_id = Column(Integer, nullable=True)
    section_id = Column(Integer, nullable=True)
    
    category = Column(String, default="grammar")  # grammar, structure, style, fact_check, visual_recommendation
    original_text = Column(Text, nullable=False)
    suggested_text = Column(Text, nullable=False)
    explanation = Column(Text, default="")
    status = Column(String, default="pending")  # pending, accepted, rejected
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    book = relationship("Book", back_populates="suggestions")


class AIJob(Base):
    __tablename__ = "ai_jobs"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, nullable=False)
    job_type = Column(String, nullable=False)  # document_ocr, structure_analysis, style_audit, fact_check
    status = Column(String, default="queued")  # queued, processing, completed, failed
    progress_percentage = Column(Integer, default=0)
    message = Column(String, default="")
    result_data = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

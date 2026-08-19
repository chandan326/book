from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    sender_name = Column(String, nullable=True)
    sender_email = Column(String, nullable=True)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    attachment_filename = Column(String, nullable=True)
    status = Column(String, default="Pending")  # Pending, In Review, Resolved
    target_email = Column(String, default="chandan.rai771714@gmail.com")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

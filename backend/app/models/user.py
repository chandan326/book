import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, default="")
    role = Column(String, default="User")  # "Super Admin", "Admin", "User", "Moderator"
    is_active = Column(Boolean, default=True)
    
    bio = Column(Text, default="")
    country = Column(String, default="")
    language = Column(String, default="English")
    writing_preferences = Column(String, default="Non-fiction")
    profile_photo = Column(String, default="")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    books = relationship("Book", back_populates="author", cascade="all, delete-orphan")
    reading_history = relationship("ReadingProgress", back_populates="user", cascade="all, delete-orphan")
    highlights = relationship("Highlight", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")

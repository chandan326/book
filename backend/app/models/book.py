import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    subtitle = Column(String, default="")
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    genre = Column(String, default="General")
    language = Column(String, default="English")
    target_audience = Column(String, default="General Readers")
    writing_style = Column(String, default="Professional & Engaging")
    description = Column(Text, default="")
    
    status = Column(String, default="Draft")  # Draft, Processing, Editing, Ready, Private, Public
    views_count = Column(Integer, default=0)
    downloads_count = Column(Integer, default=0)
    cover_url = Column(String, default="")
    formatting_preset = Column(String, default="Non-fiction")  # Print, eBook, Academic, Novel, Non-fiction
    
    # Custom Front/Back Matter & Style Guide
    front_matter_json = Column(JSON, default=dict)
    back_matter_json = Column(JSON, default=dict)
    style_guide_json = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    author = relationship("User", back_populates="books")
    parts = relationship("Part", back_populates="book", cascade="all, delete-orphan", order_by="Part.order_index")
    chapters = relationship("Chapter", back_populates="book", cascade="all, delete-orphan", order_by="Chapter.order_index")
    versions = relationship("BookVersion", back_populates="book", cascade="all, delete-orphan", order_by="BookVersion.created_at.desc()")
    suggestions = relationship("AISuggestion", back_populates="book", cascade="all, delete-orphan")


class BookVersion(Base):
    __tablename__ = "book_versions"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    version_name = Column(String, nullable=False)  # e.g., "v1.0 - Draft", "v1.1 - Post AI Edit"
    description = Column(String, default="")
    snapshot_data = Column(JSON, nullable=False)  # Complete book structure + section contents
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    book = relationship("Book", back_populates="versions")


class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    title = Column(String, nullable=False)
    order_index = Column(Integer, default=0)

    book = relationship("Book", back_populates="parts")
    chapters = relationship("Chapter", back_populates="part", cascade="all, delete-orphan", order_by="Chapter.order_index")


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    part_id = Column(Integer, ForeignKey("parts.id"), nullable=True)
    title = Column(String, nullable=False)
    summary = Column(Text, default="")
    order_index = Column(Integer, default=0)
    readability_score = Column(Float, default=85.0)

    book = relationship("Book", back_populates="chapters")
    part = relationship("Part", back_populates="chapters")
    sections = relationship("Section", back_populates="chapter", cascade="all, delete-orphan", order_by="Section.order_index")


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, default="")
    order_index = Column(Integer, default=0)

    chapter = relationship("Chapter", back_populates="sections")
    subsections = relationship("Subsection", back_populates="section", cascade="all, delete-orphan", order_by="Subsection.order_index")


class Subsection(Base):
    __tablename__ = "subsections"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, default="")
    order_index = Column(Integer, default=0)

    section = relationship("Section", back_populates="subsections")

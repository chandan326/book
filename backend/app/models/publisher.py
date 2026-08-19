from sqlalchemy import Column, Integer, String, Float, Boolean, Text
from app.database import Base

class Publisher(Base):
    __tablename__ = "publishers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    publisher_type = Column(String, default="Traditional Publisher")  # Traditional, Hybrid, Self-Publishing Print, Academic Press
    address = Column(String, nullable=False)
    city = Column(String, default="New York")
    country = Column(String, default="United States")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    website = Column(String, default="")
    phone = Column(String, default="")
    rating = Column(Float, default=4.5)
    description = Column(Text, default="")
    is_verified = Column(Boolean, default=True)

from pydantic import BaseModel
from typing import Optional

class PublisherOut(BaseModel):
    id: int
    name: str
    publisher_type: str
    address: str
    city: str
    country: str
    latitude: float
    longitude: float
    website: str
    phone: str
    rating: float
    description: str
    is_verified: bool
    distance_miles: Optional[float] = None

    class Config:
        from_attributes = True

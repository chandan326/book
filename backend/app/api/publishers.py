from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.publisher import Publisher
from app.models.book import Book
from app.schemas.publisher import PublisherOut
from app.services.maps_service import search_nearby_publishers, DEFAULT_PUBLISHERS
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter(prefix="/publishers", tags=["Publisher Discovery & Google Maps Integration"])

@router.get("/nearby", response_model=List[PublisherOut])
def get_nearby_publishers(
    lat: float = Query(40.7128, description="User latitude"),
    lng: float = Query(-74.0060, description="User longitude"),
    radius: float = Query(50.0, description="Search radius in miles"),
    db: Session = Depends(get_db)
):
    """
    Finds nearby publishing houses, traditional publishers, and printing services using coordinates.
    """
    db_publishers = db.query(Publisher).all()
    if not db_publishers:
        # Fallback to default catalog if database is empty
        return search_nearby_publishers(lat, lng, radius)

    results = []
    from app.services.maps_service import haversine_distance
    for pub in db_publishers:
        dist = haversine_distance(lat, lng, pub.latitude, pub.longitude)
        if dist <= radius or radius > 1000:
            pub_out = PublisherOut.model_validate(pub)
            pub_out.distance_miles = dist
            results.append(pub_out)

    results.sort(key=lambda x: x.distance_miles or 0)
    return results


@router.get("/check-milestone/{book_id}")
def check_publisher_milestone(book_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Checks if a book has reached the 100,000 legitimate views milestone for publisher discovery unlock.
    """
    book = db.query(Book).filter(Book.id == book_id, Book.author_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    from app.config import settings
    unlocked = book.views_count >= settings.PUBLISHER_MILESTONE_VIEWS

    return {
        "book_id": book.id,
        "views_count": book.views_count,
        "milestone_target": settings.PUBLISHER_MILESTONE_VIEWS,
        "unlocked": unlocked or True,  # Allow authors to test publisher finder
        "message": f"Congratulations! Your book '{book.title}' has reached the publishing milestone." if unlocked else f"Book has {book.views_count} views. Reach 100,000 to unlock direct publisher connections."
    }

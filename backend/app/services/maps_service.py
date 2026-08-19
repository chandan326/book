import math
from typing import List, Dict, Any

# Pre-populated publisher catalog for local / global discovery
DEFAULT_PUBLISHERS = [
    {
        "id": 1,
        "name": "Penguin Random House Publishing Center",
        "publisher_type": "Traditional Publisher",
        "address": "1745 Broadway, New York, NY 10019",
        "city": "New York",
        "country": "United States",
        "latitude": 40.7656,
        "longitude": -73.9829,
        "website": "https://www.penguinrandomhouse.com",
        "phone": "+1 (212) 782-9000",
        "rating": 4.8,
        "description": "Global publishing leader offering comprehensive manuscript acquisition, editorial support, and global distribution.",
        "is_verified": True
    },
    {
        "id": 2,
        "name": "HarperCollins Authors & Press Guild",
        "publisher_type": "Traditional Publisher",
        "address": "195 Broadway, New York, NY 10007",
        "city": "New York",
        "country": "United States",
        "latitude": 40.7107,
        "longitude": -74.0093,
        "website": "https://www.harpercollins.com",
        "phone": "+1 (212) 207-7000",
        "rating": 4.7,
        "description": "Distinguished publishing house specializing in fiction, non-fiction, academic research, and memoirs.",
        "is_verified": True
    },
    {
        "id": 3,
        "name": "Apex Self-Publishing & Print Studio",
        "publisher_type": "Self-Publishing Print",
        "address": "500 5th Ave, New York, NY 10110",
        "city": "New York",
        "country": "United States",
        "latitude": 40.7538,
        "longitude": -73.9818,
        "website": "https://www.apexprintstudio.com",
        "phone": "+1 (800) 555-0199",
        "rating": 4.9,
        "description": "Premium on-demand print facility offering hardcover, paperback, and custom book layout services.",
        "is_verified": True
    },
    {
        "id": 4,
        "name": "Oxford Academic & University Press",
        "publisher_type": "Academic Press",
        "address": "198 Madison Ave, New York, NY 10016",
        "city": "New York",
        "country": "United States",
        "latitude": 40.7481,
        "longitude": -73.9840,
        "website": "https://global.oup.com",
        "phone": "+1 (212) 726-6000",
        "rating": 4.8,
        "description": "Prestigious academic publisher supporting scholarly literature, textbooks, and scientific research publications.",
        "is_verified": True
    }
]

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes real-world distance in miles between two coordinate points.
    """
    R = 3958.8  # Earth radius in miles
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

def search_nearby_publishers(lat: float, lng: float, radius_miles: float = 50.0) -> List[Dict[str, Any]]:
    """
    Searches nearby publishers relative to user lat/lng coordinates and sorts by distance.
    """
    results = []
    for pub in DEFAULT_PUBLISHERS:
        dist = haversine_distance(lat, lng, pub["latitude"], pub["longitude"])
        if dist <= radius_miles or radius_miles > 1000:
            item = dict(pub)
            item["distance_miles"] = dist
            results.append(item)

    results.sort(key=lambda x: x["distance_miles"])
    return results

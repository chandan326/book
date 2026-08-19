import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "PANNA AI Book Creation & Publishing Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-book-platform-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "chandan.rai771714@gmail.com")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    
    # Milestone threshold for publisher discovery (configurable by admin)
    PUBLISHER_MILESTONE_VIEWS: int = int(os.getenv("PUBLISHER_MILESTONE_VIEWS", "100000"))
    
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "DEMO_MAPS_KEY_AI_BOOKS")

settings = Settings()

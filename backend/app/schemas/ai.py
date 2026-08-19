from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class AISuggestionOut(BaseModel):
    id: int
    book_id: int
    chapter_id: Optional[int]
    section_id: Optional[int]
    category: str
    original_text: str
    suggested_text: str
    explanation: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AIReviewRequest(BaseModel):
    book_id: int
    chapter_id: Optional[int] = None
    review_types: List[str] = ["grammar", "structure", "consistency", "fact_check", "visual_recommendations"]

class AIAssistantRequest(BaseModel):
    book_id: int
    chapter_id: Optional[int] = None
    section_id: Optional[int] = None
    user_prompt: str
    selected_text: Optional[str] = ""

class AIAssistantResponse(BaseModel):
    response: str
    suggestions: List[Dict[str, Any]] = []
    category: str = "assistant"

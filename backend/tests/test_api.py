import sys
import os
sys.path.insert(0, os.path.abspath("."))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_user_registration_and_login():
    # Register Super Admin User
    reg_payload = {
        "email": "chandan.rai771714@gmail.com",
        "password": "Password123!",
        "full_name": "Chandan Rai"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "Super Admin"

    # Login
    login_res = client.post("/api/v1/auth/login", data={"username": "chandan.rai771714@gmail.com", "password": "Password123!"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token

def test_book_creation_and_ai_audit():
    # Register & Login
    client.post("/api/v1/auth/register", json={"email": "author@example.com", "password": "Pass123!","full_name": "Test Author"})
    login_res = client.post("/api/v1/auth/login", data={"username": "author@example.com", "password": "Pass123!"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create Book
    book_payload = {
        "title": "Automated Testing for Authors",
        "subtitle": "A Practical Guide",
        "genre": "Technology",
        "description": "Book created during automated test run."
    }
    book_res = client.post("/api/v1/books/", json=book_payload, headers=headers)
    assert book_res.status_code == 201
    book_id = book_res.json()["id"]

    # AI Audit Chapter
    audit_res = client.post("/api/v1/ai/audit-chapter", json={"book_id": book_id}, headers=headers)
    assert audit_res.status_code == 200
    audit_data = audit_res.json()
    assert "readability_score" in audit_data
    assert "suggestions" in audit_data

def test_publisher_discovery():
    res = client.get("/api/v1/publishers/nearby?lat=40.7128&lng=-74.0060")
    assert res.status_code == 200
    publishers = res.json()
    assert len(publishers) > 0
    assert "distance_miles" in publishers[0]

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from app.database import get_db
from app.models.complaint import Complaint
from app.models.user import User
from app.services.auth_service import get_current_admin
import os
import uuid

router = APIRouter(tags=["Complaints"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def submit_complaint(
    sender_name: Optional[str] = Form(None),
    sender_email: Optional[str] = Form(None),
    subject: str = Form(...),
    message: str = Form(...),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    attachment_name = None
    if attachment:
        os.makedirs("uploads/complaints", exist_ok=True)
        file_ext = os.path.splitext(attachment.filename)[1]
        attachment_name = f"{uuid.uuid4().hex}{file_ext}"
        filepath = os.path.join("uploads/complaints", attachment_name)
        with open(filepath, "wb") as f:
            f.write(attachment.file.read())

    final_name = sender_name or "Anonymous Author"
    final_email = sender_email or "Not Provided"

    complaint = Complaint(
        user_id=None,
        sender_name=final_name,
        sender_email=final_email,
        subject=subject,
        message=message,
        attachment_filename=attachment_name,
        target_email="chandan.rai771714@gmail.com",
        status="Pending"
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    print(f"[NOTIFICATION SENT TO SUPER ADMIN] Complaint #{complaint.id} ('{subject}') from {final_email} routed directly to chandan.rai771714@gmail.com")

    return {
        "message": "Complaint submitted successfully and routed directly to platform admin.",
        "id": complaint.id,
        "target_email": complaint.target_email
    }

@router.get("/")
def get_complaints(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    return complaints

@router.put("/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    status_val: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    complaint.status = status_val
    db.commit()
    return {"message": "Status updated successfully", "status": complaint.status}

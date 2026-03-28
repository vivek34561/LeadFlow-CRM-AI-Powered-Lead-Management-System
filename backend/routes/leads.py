from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from sqlalchemy.sql import func # Add this to the top of your imports

import schemas
import models
from auth import get_current_active_user
from database import get_db
from services import lead_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=schemas.LeadResponse, status_code=201)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    db_lead = lead_service.get_lead_by_email(db, email=lead.email)
    if db_lead:
        raise HTTPException(status_code=400, detail="Email already registered")
    return lead_service.create_lead(db=db, lead=lead)

@router.get("/", response_model=List[schemas.LeadResponse])
def read_leads(
    skip: int = 0, 
    limit: int = 100, 
    score: Optional[str] = None,
    date_from: Optional[date] = None,
    db: Session = Depends(get_db)
):
    leads = lead_service.get_leads(db, skip=skip, limit=limit, score=score, date_from=date_from)
    return leads

@router.get("/pending-followups", response_model=List[schemas.LeadResponse])
def get_pending_followups(db: Session = Depends(get_db)):
    return lead_service.get_pending_followups(db)

@router.get("/{lead_id}", response_model=schemas.LeadResponse)
def read_lead(lead_id: int, db: Session = Depends(get_db)):
    db_lead = lead_service.get_lead(db, lead_id=lead_id)
    if db_lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return db_lead

@router.patch("/{lead_id}", response_model=schemas.LeadResponse)
def update_lead(lead_id: int, lead: schemas.LeadUpdate, db: Session = Depends(get_db)):
    db_lead = lead_service.update_lead(db, lead_id=lead_id, lead_update=lead)
    if db_lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return db_lead


# In backend/routes/leads.py


@router.post("/{lead_id}/increment-followup", response_model=schemas.LeadResponse)
def increment_followup(lead_id: int, db: Session = Depends(get_db)):
    db_lead = lead_service.get_lead(db, lead_id=lead_id)
    if db_lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    current_count = db_lead.followup_count or 0
    # Stop them if they hit the limit manually just in case
    if current_count >= 3:
        raise HTTPException(status_code=400, detail="Max followups reached")

    db_lead.followup_count = current_count + 1
    db_lead.status = "CONTACTED" # They are still a lead, just contacted!
    db_lead.updated_at = func.now() # <--- IMPORTANT: Resets the timer!
    
    db.commit()
    db.refresh(db_lead)
    return db_lead
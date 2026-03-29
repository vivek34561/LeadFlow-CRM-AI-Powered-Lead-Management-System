from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, and_
import models, schemas
from datetime import date, datetime
from utils.helpers import calculate_conversion_rate

def get_leads(db: Session, user: models.User, skip: int = 0, limit: int = 100, score: str = None, date_from: date = None):
    query = db.query(models.Lead).filter(models.Lead.user_id == user.id)
    
    if score:
        query = query.filter(models.Lead.score == score)
    if date_from:
        query = query.filter(models.Lead.created_at >= date_from)
        
    return query.order_by(desc(models.Lead.created_at)).offset(skip).limit(limit).all()

def get_lead(db: Session, lead_id: int, user: models.User):
    return db.query(models.Lead).filter(models.Lead.id == lead_id, models.Lead.user_id == user.id).first()

def get_lead_by_email(db: Session, email: str, user: models.User):
    return db.query(models.Lead).filter(models.Lead.email == email, models.Lead.user_id == user.id).first()

def create_lead(db: Session, lead: schemas.LeadCreate, user: models.User):
    payload = lead.model_dump()
    payload["user_id"] = user.id
    db_lead = models.Lead(**payload)
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

def update_lead(db: Session, lead_id: int, lead_update: schemas.LeadUpdate, user: models.User):
    db_lead = get_lead(db, lead_id, user)
    if not db_lead:
        return None
        
    update_data = lead_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_lead, key, value)
        
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

def get_pending_followups(db: Session, user: models.User):
    return db.query(models.Lead).filter(
        models.Lead.user_id == user.id,
        models.Lead.followup_count < 3,
        models.Lead.status != "CONVERTED",
        models.Lead.status != "CLOSED"
    ).all()

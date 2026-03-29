from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas
import models
from auth import get_current_active_user
from database import get_db
from services import analytics_service

router = APIRouter()

@router.get("/", response_model=schemas.AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return analytics_service.get_analytics_summary(db, current_user)

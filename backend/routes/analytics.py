from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas
from database import get_db
from services import analytics_service

router = APIRouter()

@router.get("/", response_model=schemas.AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
):
    return analytics_service.get_analytics_summary(db)

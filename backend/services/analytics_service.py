from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from utils.helpers import calculate_conversion_rate

def get_analytics_summary(db: Session):
    total_leads = db.query(models.Lead).count()
    
    hot_leads = db.query(models.Lead).filter(models.Lead.score == "HOT").count()
    warm_leads = db.query(models.Lead).filter(models.Lead.score == "WARM").count()
    cold_leads = db.query(models.Lead).filter(models.Lead.score == "COLD").count()
    
    converted_leads = db.query(models.Lead).filter(models.Lead.status == "CONVERTED").count()
    
    conversion_rate = calculate_conversion_rate(converted_leads, total_leads)
    
    return {
        "total_leads": total_leads,
        "hot_leads": hot_leads,
        "warm_leads": warm_leads,
        "cold_leads": cold_leads,
        "conversion_rate": conversion_rate
    }

from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from utils.helpers import calculate_conversion_rate

def get_analytics_summary(db: Session, user: models.User):
    base = db.query(models.Lead).filter(models.Lead.user_id == user.id)

    total_leads = base.count()
    hot_leads = base.filter(models.Lead.score == "HOT").count()
    warm_leads = base.filter(models.Lead.score == "WARM").count()
    cold_leads = base.filter(models.Lead.score == "COLD").count()
    converted_leads = base.filter(models.Lead.status == "CONVERTED").count()
    
    conversion_rate = calculate_conversion_rate(converted_leads, total_leads)
    
    return {
        "total_leads": total_leads,
        "hot_leads": hot_leads,
        "warm_leads": warm_leads,
        "cold_leads": cold_leads,
        "conversion_rate": conversion_rate
    }

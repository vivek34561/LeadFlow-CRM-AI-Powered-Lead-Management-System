from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    role = Column(String(50), default="USER") # "USER" or "ADMIN"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now())

    leads = relationship("Lead", back_populates="owner")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    interest = Column(String(255))
    budget = Column(String(255))
    timeline = Column(String(255))
    intent = Column(String(255))
    score = Column(String(50), index=True) # HOT, WARM, COLD
    status = Column(String(50), default="NEW", index=True) # NEW, CONTACTED, CONVERTED, CLOSED
    followup_count = Column(Integer, default=0)
    source = Column(String(255))
    
    # Optional field for AI explanation
    score_explanation = Column(Text, nullable=True)
    
    # Future compatibility
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True) # For multi-tenant SaaS
    owner = relationship("User", back_populates="leads")

    submitted_at = Column(DateTime(timezone=True), default=func.now())
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

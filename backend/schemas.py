from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class LeadBase(BaseModel):
    name: str = Field(..., max_length=255)
    email: EmailStr
    interest: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    intent: Optional[str] = None
    source: Optional[str] = None

class LeadCreate(LeadBase):
    score: Optional[str] = "COLD" # Can be computed by AI or set by n8n
    status: Optional[str] = "NEW"
    score_explanation: Optional[str] = None

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    followup_count: Optional[int] = None
    score: Optional[str] = None
    score_explanation: Optional[str] = None

class LeadResponse(LeadBase):
    id: int
    score: str
    status: str
    followup_count: int
    score_explanation: Optional[str] = None
    user_id: Optional[int] = None
    submitted_at: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AnalyticsResponse(BaseModel):
    total_leads: int
    hot_leads: int
    warm_leads: int
    cold_leads: int
    conversion_rate: float


class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

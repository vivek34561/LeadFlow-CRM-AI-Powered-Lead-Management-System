from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import schemas
from auth import verify_google_token
from database import get_db
from services import auth_service

router = APIRouter()


@router.post("/signup", response_model=schemas.UserResponse, status_code=201)
def signup(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"Signup request received for email: {payload.email}");
    existing = auth_service.get_user_by_email(db, payload.email)
    print(f"Existing user check for email {payload.email}: {'Found' if existing else 'Not Found'}")
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = auth_service.create_user(db, payload.email, payload.password)
    print(f"User created with email: {user.email}")
    return user


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.GoogleLogin, db: Session = Depends(get_db)):
    if not payload.id_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing Google ID token")
    claims = verify_google_token(payload.id_token)
    email = claims.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google token missing email")

    user = auth_service.get_user_by_email(db, email)
    if not user:
        user = auth_service.create_user(db, email=email, password=None)

    return {"access_token": payload.id_token, "token_type": "google"}

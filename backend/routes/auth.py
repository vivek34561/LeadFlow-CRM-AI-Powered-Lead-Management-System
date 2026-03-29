from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import schemas
from auth import create_access_token
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
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}

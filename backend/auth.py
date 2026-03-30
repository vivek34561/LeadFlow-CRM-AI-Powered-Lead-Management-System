import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from services import auth_service

http_bearer = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)


def verify_google_token(token: str) -> dict:
    """Validate a Google ID token and ensure it targets our client."""
    try:
        claims = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=60,
        )
    except Exception as exc:
        logger.exception("Google token verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {type(exc).__name__}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if claims.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token not meant for this application",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if claims.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return claims


def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(http_bearer),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not credentials:
        raise credentials_exception

    claims = verify_google_token(credentials.credentials)
    email: str | None = claims.get("email")
    if email is None:
        raise credentials_exception

    user = auth_service.get_user_by_email(db, email)
    if user is None:
        # First-time login via Google creates a user record
        user = auth_service.create_user(db, email=email, password=None)
    return user


def get_current_active_user(current_user=Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

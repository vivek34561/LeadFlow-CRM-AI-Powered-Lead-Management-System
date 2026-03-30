from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Lead Management SaaS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Auth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str | None = None  # Not used in ID token flow, kept to avoid env errors
    GOOGLE_REDIRECT_URI: str | None = None   # Not used in current flow
    COOKIE_SECRET_KEY: str | None = None     # Not used in current flow
    SECRET_KEY: str = "change-me"  # Legacy; kept for compatibility
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # Legacy
    
    # Database
    DATABASE_URL: str # Force read from .env

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()

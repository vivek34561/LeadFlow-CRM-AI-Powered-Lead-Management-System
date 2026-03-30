from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import engine, Base
from routes import leads, analytics
from utils.helpers import configure_logging

# Configure basic logging
configure_logging()

# Create database tables
Base.metadata.create_all(bind=engine)

# Normalize API paths and avoid double slashes
def build_api_path(*parts: str) -> str:
    cleaned = [p.strip("/") for p in parts if p and p.strip("/")]
    return "/" + "/".join(cleaned) if cleaned else ""

API_PREFIX = build_api_path(settings.API_V1_STR)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=build_api_path(API_PREFIX, "openapi.json") or "/openapi.json",
)

# CORS middleware for Frontend Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("CORS middleware configured to allow requests from http://localhost:3000")
# Include Routers
app.include_router(leads.router, prefix=build_api_path(API_PREFIX, "leads"), tags=["leads"])
app.include_router(analytics.router, prefix=build_api_path(API_PREFIX, "analytics"), tags=["analytics"])
print("Routers for leads and analytics have been included in the FastAPI application.")

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Lead Management SaaS Backend is running."}

# Render and generic root health probe
@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Lead Management SaaS Backend",
        "docs": build_api_path(API_PREFIX, "docs"),
        "openapi": build_api_path(API_PREFIX, "openapi.json"),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

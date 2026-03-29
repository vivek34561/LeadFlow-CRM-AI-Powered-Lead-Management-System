from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import engine, Base
from routes import leads, analytics, auth
from utils.helpers import configure_logging

# Configure basic logging
configure_logging()

# Create database tables
Base.metadata.create_all(bind=engine)

# Normalize API prefix to always start with a leading slash (env override safe)
API_PREFIX = f"/{settings.API_V1_STR.strip('/')}"

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{API_PREFIX}/openapi.json"
)

# CORS middleware for Frontend Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # In production, restrict this to frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("CORS middleware configured to allow requests from http://localhost:3000")
# Include Routers
app.include_router(leads.router, prefix=f"{API_PREFIX}/leads", tags=["leads"])
app.include_router(analytics.router, prefix=f"{API_PREFIX}/analytics", tags=["analytics"])
app.include_router(auth.router, prefix=f"{API_PREFIX}/auth", tags=["auth"])
print("Routers for leads, analytics, and auth have been included in the FastAPI application.")

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Lead Management SaaS Backend is running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

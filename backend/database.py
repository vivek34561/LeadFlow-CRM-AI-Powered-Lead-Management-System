from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

print(f"Initializing database with URL: {settings.DATABASE_URL}")
engine = create_engine(settings.DATABASE_URL)
print("Database engine created successfully")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    print("Creating new database session")
    db = SessionLocal()
    print("Database session created")
    try:
        print("Yielding database session to route handler")
        yield db
        print("Route handler completed, closing database session")
    finally:
        print("Closing database session")
        db.close()

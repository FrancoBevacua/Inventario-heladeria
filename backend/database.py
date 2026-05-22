import os
from dotenv import load_dotenv
from typing import Annotated
from fastapi import Depends
from sqlmodel import SQLModel, create_engine, Session, Field, select

load_dotenv()

database_url: str = os.getenv("DATABASE_URL")

# Fail-Fast: if the variable is missing, stop the application.
if not database_url:
    raise ValueError("CRITICAL: DATABASE_URL enviroment variable is not set!")

# SQLAlchemy requires 'postgresql://'
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(database_url)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

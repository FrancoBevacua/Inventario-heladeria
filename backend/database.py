from typing import Annotated
from fastapi import Depends
from sqlmodel import SQLModel, create_engine, Session, Field, select

#sql_filename: str = "database.db"
DATABASE_URL: str = "postgresql://neondb_owner:npg_GsXLJxhKd63S@ep-withered-moon-aqz1ogz0-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

connect_args = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

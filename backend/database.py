from typing import Annotated
from fastapi import Depends
from sqlmodel import SQLModel, create_engine, Session, Field, select

sql_filename: str = "database.db"
sqlite_url: str = f"sqlite:///{sql_filename}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

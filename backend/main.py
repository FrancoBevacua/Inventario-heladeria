from contextlib import asynccontextmanager
from fastapi import FastAPI
from database import create_db_and_tables
from routers import helados


# Inicio de la aplicación (crear base de datos, tablas, etc)
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(helados.router)

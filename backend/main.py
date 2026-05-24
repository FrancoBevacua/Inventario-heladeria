from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_db_and_tables
from routers import helados
from typing import List


# Inicio de la aplicación (crear base de datos, tablas, etc)
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

origins: List[str] = [
    "https://inventario-heladeria-git-develop-francos-projects-c738d0c4.vercel.app/",
    "https://inventario-heladeria-backend.onrender.com/helados/"
]

# CORS - permitir solicitudes desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    max_age=3600
)

app.include_router(helados.router)

from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select
from enum import StrEnum, auto
from typing import Annotated
from pydantic import BaseModel

# Enum para tipos de helados
class Tipos(StrEnum):
    CREMAS = "Cremas"
    DULCES = "Dulces"
    CHOCOLATES = "Chocolates"
    AGUA = "Agua"
    ESPECIALIDAD = "Especialidad"

# Clase Helado
class Helado(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str
    color: str
    tipo: Tipos
    esta_disponible: bool
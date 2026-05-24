import datetime

from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select, Relationship
from enum import StrEnum, auto
from typing import Annotated, List
from pydantic import BaseModel

# Enum para tipos de helados y ubicación
class Tipos(StrEnum):
    CREMAS = "Cremas"
    DULCES = "Dulces"
    CHOCOLATES = "Chocolates"
    AGUA = "Agua"
    ESPECIALIDAD = "Especialidad"

class Ubicacion(StrEnum):
    POZO = "Pozo"
    DESPACHO = "Despacho"

# Clase Helado
class Helado(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str
    color: str
    tipo: Tipos
    #esta_disponible: bool = Field(default=True)
    # Relación: Un helado tiene muchos lotes activos
    # cascade_delete hace que si borrás el gusto, se borren sus lotes automáticamente
    lotes: List["Lote"] = Relationship(back_populates="helado", cascade_delete=True)

# Clase Lote
class Lote(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    fecha_elaboracion: datetime.date
    cantidad_baldes: int
    ubicacion: Ubicacion = Field(default=Ubicacion.POZO)

    # Clave foránea que une el lote a un gusto de helado específico
    helado_id: int = Field(foreign_key="helado.id")
    helado: Helado = Relationship(back_populates="lotes")

# Mandar al frontend los datos anidados.
class LoteRead(SQLModel):
    id: int
    fecha_elaboracion: datetime.date
    cantidad_baldes: int
    ubicacion: Ubicacion

class HeladoReadWithLotes(SQLModel):
    id: int
    nombre: str
    color: str
    tipo: Tipos
    lotes: List[LoteRead]

# Este endpoint recibirá el lote_id y las unidades a mover, gestionando la división del lote si es necesario
class RequestTraspaso(BaseModel):
    lote_id: int
    cantidad_a_mover: int

from fastapi import APIRouter
from fastapi.params import Depends

from models import Tipos, Helado
from database import SessionDep, get_session
from sqlmodel import Session, select

router = APIRouter(
    prefix="/helados",
    tags=["helados"]
)

# Consultar toda la lista de helados
@router.get("/")
def get_helados(session: SessionDep):
    statement = select(Helado)
    results = session.exec(statement)
    lista_helados = [helado for helado in results]
    return {"lista": lista_helados}

# Consultar sólo los helados por disponibilidad
@router.get("/disponibles")
def get_helados_disponibles(session: SessionDep):
    disponibles = session.exec(select(Helado.nombre).where(Helado.esta_disponible == True)).all()
    no_disponibles = session.exec(select(Helado.nombre).where(Helado.esta_disponible == False)).all()
    return {"Disponibles": disponibles, "No Disponibles": no_disponibles}

# Consultar disponibilidad por color
@router.get("/disponibles/{color}")
def get_helados_disponibles_por_color(color: str, session: SessionDep):
    disponibles_por_color = session.exec(select(Helado).where(Helado.esta_disponible == True, Helado.color == color)).all()
    nombres = [helado.nombre for helado in disponibles_por_color]
    return {"Disponibles Color": nombres}

# Consultar disponibilidad por tipo
@router.get("/{tipo}")
def get_tipo(tipo: Tipos, session: SessionDep):
    tipos_helados_disponibles = session.exec(select(Helado).where(Helado.esta_disponible == True, Helado.tipo == tipo)).all()
    nombres = [helado.nombre for helado in tipos_helados_disponibles]
    return {"Helados disponibles": nombres}

# POST - Crear nuevo helado
@router.post("/")
def crear_helado(helado: Helado, session: SessionDep) -> Helado:
    session.add(helado)
    session.commit()
    session.refresh(helado)
    return helado

# PUT - Actualizar helado
@router.put("/")
def actualizar_helado(helado_id: int, nombre: str, color: str, tipo: Tipos, esta_disponible: bool, session: Session = Depends(get_session)):
    helado_encontrado = session.get(Helado, helado_id)
    helado_encontrado.nombre = nombre
    helado_encontrado.color = color
    helado_encontrado.tipo = tipo
    helado_encontrado.esta_disponible = esta_disponible

    session.add(helado_encontrado)
    session.commit()
    session.refresh(helado_encontrado)
    return helado_encontrado

# DELETE - Eliminar helado
@router.delete("/")
def eliminar_helado(helado_id: int, session: Session = Depends(get_session)):
    helado_encontrado = session.get(Helado, helado_id)
    session.delete(helado_encontrado)
    session.commit()
    return {"Helado eliminado": helado_encontrado}
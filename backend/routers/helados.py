import datetime

from fastapi import APIRouter, HTTPException
from fastapi.params import Depends

from models import Tipos, Ubicacion, Helado, HeladoReadWithLotes, RequestTraspaso, Lote
from database import SessionDep, get_session
from sqlmodel import Session, select
from typing import List

router = APIRouter(
    prefix="/helados",
    tags=["helados"]
)

# Consultar toda la lista de helados
@router.get("/", response_model=List[HeladoReadWithLotes])
def get_helados(session: SessionDep):
    helados = session.exec(select(Helado)).all()
    print("Helados: ", helados)
    return helados

# Consultar sólo los helados por disponibilidad
#@router.get("/disponibles")
#def get_helados_disponibles(session: SessionDep):
#    disponibles = session.exec(select(Helado.nombre).where(Helado.esta_disponible == True)).all()
#    no_disponibles = session.exec(select(Helado.nombre).where(Helado.esta_disponible == False)).all()
#    return {"Disponibles": disponibles, "No Disponibles": no_disponibles}

# Consultar disponibilidad por color
#@router.get("/disponibles/{color}")
#def get_helados_disponibles_por_color(color: str, session: SessionDep):
#    disponibles_por_color = session.exec(select(Helado).where(Helado.esta_disponible == True, Helado.color == color)).all()
#    nombres = [helado.nombre for helado in disponibles_por_color]
#    return {"Disponibles Color": nombres}

# Consultar disponibilidad por tipo
#@router.get("/{tipo}")
#def get_tipo(tipo: Tipos, session: SessionDep):
#    tipos_helados_disponibles = session.exec(select(Helado).where(Helado.esta_disponible == True, Helado.tipo == tipo)).all()
#    nombres = [helado.nombre for helado in tipos_helados_disponibles]
#    return {"Helados disponibles": nombres}

# POST - Crear nuevo helado
#@router.post("/")
#def crear_helado(helado: Helado, session: SessionDep) -> Helado:
#    session.add(helado)
#    session.commit()
#    session.refresh(helado)
#    return helado

# POST - Traspasos de lotes
@router.post("/lotes/traspasar")
def traspasar_baldes(pedido: RequestTraspaso, session: Session = Depends(get_session)):
    lote_origen = session.get(Lote, pedido.lote_id)
    if not lote_origen or lote_origen.cantidad_baldes < pedido.cantidad_a_mover:
        raise HTTPException(status_code=400, detail="Cantidad inválida o lote no encontrado.")
    
    nueva_ubicacion = Ubicacion.DESPACHO if lote_origen.ubicacion == Ubicacion.POZO else Ubicacion.POZO

    # Se mueve el lote completo
    if lote_origen.cantidad_baldes == pedido.cantidad_a_mover:
        lote_origen.ubicacion = nueva_ubicacion

    # Se divide el lote
    else:
        lote_origen.cantidad_baldes -= pedido.cantidad_a_mover

        # Se crea el nuevo lote en la ubicación elegida
        nuevo_lote = Lote(
            fecha_elaboracion=lote_origen.fecha_elaboracion,
            cantidad_baldes=lote_origen.cantidad_baldes,
            ubicacion=lote_origen.ubicacion,
            helado_id=lote_origen.helado_id
        )
        session.add(nuevo_lote)

    session.add(lote_origen)
    session.commit()
    return {"status" : "Traspaso exitoso"}


# PUT - Actualizar helado
#@router.put("/")
#def actualizar_helado(helado_id: int, nombre: str, color: str, tipo: Tipos, esta_disponible: bool, fecha_elaboracion: datetime.date, cantidad_baldes: int, session: Session = Depends(get_session)):
#    helado_encontrado = session.get(Helado, helado_id)
#    helado_encontrado.nombre = nombre
#    helado_encontrado.color = color
#    helado_encontrado.tipo = tipo
    #helado_encontrado.esta_disponible = esta_disponible
#    helado_encontrado.fecha_elaboracion = fecha_elaboracion
#    helado_encontrado.cantidad_baldes = cantidad_baldes

#    session.add(helado_encontrado)
#    session.commit()
#    session.refresh(helado_encontrado)
#    return helado_encontrado

# DELETE - Eliminar helado
@router.delete("/")
def eliminar_helado(helado_id: int, session: Session = Depends(get_session)):
    helado_encontrado = session.get(Helado, helado_id)
    session.delete(helado_encontrado)
    session.commit()
    return {"Helado eliminado": helado_encontrado}
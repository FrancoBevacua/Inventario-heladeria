from models import Helado, Tipos

# Lista de helados - vacía, los helados se agregan desde el frontend
lista_helados: list[Helado] = []

# Lista por colores (se actualiza dinámicamente cuando se agregan helados)
colores: list[str] = [helado.color for helado in lista_helados if helado.color]
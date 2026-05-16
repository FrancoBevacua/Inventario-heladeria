from models import Helado, Tipos

# Lista de helados - vacía, los helados se agregan desde el frontend
helados: list[Helado] = []

# Lista por colores (se actualiza dinámicamente cuando se agregan helados)
colores: list[str] = [helado.color for helado in helados if helado.color]
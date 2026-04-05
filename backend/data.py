from models import Helado, Tipos

# Lista de helados
helados: list[Helado] = []


# Algunas instancias de Helado como prueba
vainilla: Helado = Helado(
    id = 1,
    nombre = "Vainilla",
    color = "Amarillo",
    tipo = Tipos.CREMAS,
    esta_disponible = True)

chocolate: Helado = Helado(
    id = 2,
    nombre = "Chocolate",
    color = "Negro",
    tipo = Tipos.CHOCOLATES,
    esta_disponible = True)

dulce_de_leche: Helado = Helado(
    id = 3,
    nombre = "Dulce de Leche",
    color = "Marron",
    tipo = Tipos.DULCES,
    esta_disponible = True)


sambayon: Helado = Helado(
    id = 4,
    nombre = "Sambayon",
    color = "Amarillo",
    tipo = Tipos.ESPECIALIDAD,
    esta_disponible = False)

# Agregamos los objetos a la lista para consultar
helados.append(vainilla)
helados.append(chocolate)
helados.append(dulce_de_leche)
helados.append(sambayon)

# Lista por colores
colores: list[str] = [helado.color for helado in helados if helado.color]
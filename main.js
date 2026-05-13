// URL base de la API del backend para comunicación con el servidor
const API_URL = 'https://inventario-heladeria-backend.onrender.com/helados';

/**
 * Inicializa la aplicación cuando el DOM está completamente cargado
 * - Carga la lista de helados desde el backend
 * - Configura los event listeners para filtros, formulario y modal
 */
document.addEventListener('DOMContentLoaded', () => {
  // Cargar helados desde el backend al iniciar la aplicación
  cargarHelados();
  configurarBotonesFiltros();
  configurarFormulario();
  configurarModalFabrica();
});

/**
 * Obtiene la lista de helados desde el backend y actualiza la interfaz
 * Realiza una petición GET a la API y procesa la respuesta para:
 * - Renderizar las tarjetas de helados en el grid
 * - Actualizar las estadísticas del inventario
 */
async function cargarHelados() {
  try {
    const response = await fetch(API_URL);
    
    // Verificar que la respuesta sea exitosa
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    const helados = data.lista;
    
    console.log('Helados cargados:', helados);
    
    // Renderizar las tarjetas en el grid principal
    renderizarHelados(helados);
    
    // Actualizar las estadísticas (total, disponibles, faltantes)
    actualizarStats(helados);
  } catch (error) {
    console.error('Error al cargar helados:', error);
    // Mostrar mensaje de error al usuario en caso de fallo
    mostrarNotificacion('Error al cargar los datos. Intente nuevamente.', 'error');
  }
}

/**
 * Renderiza las tarjetas de helados en el grid principal
 * @param {Array} helados - Array de objetos helado provenientes del backend
 * @param {string} filtro - Tipo de helado para filtrar (opcional, default: 'todos')
 */
function renderizarHelados(helados, filtro = 'todos') {
  const grid = document.getElementById('helados-grid');
  grid.innerHTML = ''; // Limpiar grid antes de renderizar

  // Aplicar filtro por tipo si se especifica uno diferente a 'todos'
  const filtrados = filtro === 'todos' 
    ? helados 
    : helados.filter(h => h.tipo === filtro);

  // Si no hay helados después del filtro, mostrar mensaje
  if (filtrados.length === 0) {
    grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">No se encontraron helados de este tipo.</p>';
    return;
  }

  filtrados.forEach(helado => {
    // Crear elemento tarjeta con estilos dinámicos según disponibilidad
    const card = document.createElement('div');
    card.className = `glass rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all card-hover border-l-4 ${helado.esta_disponible ? 'border-blue-500' : 'border-orange-400 bg-orange-50/50'} ${!helado.esta_disponible ? 'opacity-75' : ''}`;
    card.style = `--helado-color: ${obtenerColorHex(helado.color)}`;

    // Construir HTML de la tarjeta con información del helado
    card.innerHTML = `
      <div class="flex items-start gap-4">
        <!-- Círculo de color representativo del sabor -->
        <div class="w-12 h-12 rounded-full shadow-lg flex-shrink-0" style="background: ${obtenerColorHex(helado.color)}"></div>
        
        <div class="flex-1 min-w-0">
          <!-- Nombre del helado -->
          <h3 class="font-display font-bold text-lg text-gray-800 truncate">${helado.nombre}</h3>
          
          <!-- Color y tipo del helado -->
          <p class="text-xs text-gray-500 uppercase tracking-wide">${helado.color} - ${helado.tipo}</p>
          
          <!-- Badge de estado de stock/disponibilidad -->
          <span class="inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full ${helado.esta_disponible ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}">
            ${helado.esta_disponible ? '✓ En Stock' : '✗ Sin Stock'}
          </span>
        </div>
      </div>
      
      <!-- Botones de acción -->
      <div class="flex gap-2 mt-4">
        <!-- Botón para cambiar estado de disponibilidad -->
        <button onclick="toggleDisponibilidad(${helado.id}, ${!helado.esta_disponible})" 
          class="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${helado.esta_disponible ? 'text-orange-600 hover:border-orange-400 hover:bg-orange-50' : 'text-blue-600 hover:border-blue-400 hover:bg-blue-50'}">
          ${helado.esta_disponible ? 'Marcar Falta' : 'Marcar Disponible'}
        </button>
        
        <!-- Botón para eliminar helado -->
        <button onclick="eliminarHelado(${helado.id})" class="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors">
          ×
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/**
 * Actualiza las estadísticas del inventario en el header
 * Calcula y muestra: total de gustos, disponibles y faltantes
 * @param {Array} helados - Array completo de helados
 */
function actualizarStats(helados) {
  const total = helados.length;
  const disponibles = helados.filter(h => h.esta_disponible).length;
  const faltantes = total - disponibles;

  // Actualizar elementos DOM con animación de conteo
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-disponibles').textContent = disponibles;
  document.getElementById('stat-faltantes').textContent = faltantes;
}

/**
 * Configura los event listeners para los botones de filtro por tipo
 * Permite filtrar los helados mostrados en el grid por su categoría
 */
function configurarBotonesFiltros() {
  const buttons = document.querySelectorAll('.filtro-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      // Remover clase active de todos los botones
      buttons.forEach(b => {
        b.classList.remove('bg-red-700', 'text-white', 'active');
        b.classList.add('bg-white', 'text-gray-600');
      });
      
      // Agregar clase active al botón seleccionado
      btn.classList.add('bg-red-700', 'text-white', 'active');
      btn.classList.remove('bg-white', 'text-gray-600');

      // Obtener tipo de filtro y recargar datos
      const tipo = btn.dataset.tipo;
      
      try {
        // Obtener datos actualizados del backend
        const response = await fetch(API_URL);
        const data = await response.json();
        const helados = data.lista;
        
        // Renderizar con el filtro seleccionado
        renderizarHelados(helados, tipo);
      } catch (error) {
        console.error('Error al filtrar:', error);
        mostrarNotificacion('Error al filtrar los datos.', 'error');
      }
    });
  });
}

/**
 * Configura el formulario para agregar nuevos helados
 * Valida los campos y envía una petición POST al backend
 */
function configurarFormulario() {
  const btnAgregar = document.getElementById('btn-agregar');
  
  btnAgregar.addEventListener('click', async () => {
    // Obtener valores de los inputs
    const nombre = document.getElementById('input-nombre').value.trim();
    const color = document.getElementById('input-color').value.trim();
    const tipo = document.getElementById('input-tipo').value;

    // Validación de campos requeridos
    if (!nombre || !color) {
      mostrarNotificacion('Por favor completá nombre y color', 'warning');
      return;
    }

    try {
      // Enviar petición POST al backend
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          color,
          tipo,
          esta_disponible: true, // Nuevo helado se agrega como disponible por defecto
          stock: 0 // Inicializar stock en 0
        })
      });

      if (response.ok) {
        // Limpiar formulario después de agregar exitosamente
        document.getElementById('input-nombre').value = '';
        document.getElementById('input-color').value = '';
        
        // Recargar lista de helados
        cargarHelados();
        mostrarNotificacion('¡Helado agregado exitosamente!', 'success');
      } else {
        mostrarNotificacion('Error al agregar el helado.', 'error');
      }
    } catch (error) {
      console.error('Error al agregar helado:', error);
      mostrarNotificacion('Error de conexión. Intente nuevamente.', 'error');
    }
  });
}

/**
 * Cambia el estado de disponibilidad de un helado (toggle stock)
 * @param {number} id - ID del helado a actualizar
 * @param {boolean} disponible - Nuevo estado de disponibilidad
 */
async function toggleDisponibilidad(id, disponible) {
  try {
    // Primero obtener los datos actuales del helado
    const response = await fetch(API_URL);
    const data = await response.json();
    const helados = data.lista;
    const helado = helados.find(h => h.id === id);
    
    if (!helado) {
      mostrarNotificacion('Helado no encontrado.', 'error');
      return;
    }

    // Enviar actualización al backend
    const updateResponse = await fetch(`${API_URL}?helado_id=${id}&nombre=${encodeURIComponent(helado.nombre)}&color=${encodeURIComponent(helado.color)}&tipo=${helado.tipo}&esta_disponible=${disponible}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });

    if (updateResponse.ok) {
      // Recargar lista después de actualizar
      cargarHelados();
      mostrarNotificacion(
        disponible ? 'Helado marcado como disponible.' : 'Helado marcado como faltante.', 
        disponible ? 'success' : 'warning'
      );
    } else {
      mostrarNotificacion('Error al actualizar el estado.', 'error');
    }
  } catch (error) {
    console.error('Error al actualizar:', error);
    mostrarNotificacion('Error de conexión.', 'error');
  }
}

/**
 * Elimina un helado del inventario
 * @param {number} id - ID del helado a eliminar
 */
async function eliminarHelado(id) {
  // Confirmación antes de eliminar
  if (!confirm('¿Estás seguro de eliminar este gusto?')) return;
  
  try {
    const response = await fetch(`${API_URL}?helado_id=${id}`, { method: 'DELETE' });
    
    if (response.ok) {
      // Recargar lista después de eliminar
      cargarHelados();
      mostrarNotificacion('Helado eliminado exitosamente.', 'success');
    } else {
      mostrarNotificacion('Error al eliminar el helado.', 'error');
    }
  } catch (error) {
    console.error('Error al eliminar:', error);
    mostrarNotificacion('Error de conexión.', 'error');
  }
}

/**
 * Configura el modal de "Lista Fábrica" que muestra los helados faltantes
 * Permite al usuario ver qué sabores necesitan reposición
 */
function configurarModalFabrica() {
  const btnFabrica = document.getElementById('btn-fabrica');
  const modal = document.getElementById('modal-fabrica');
  const btnCerrar = document.getElementById('btn-cerrar-modal');

  btnFabrica.addEventListener('click', async () => {
    try {
      // Obtener lista actualizada de helados
      const response = await fetch(API_URL);
      const data = await response.json();
      const helados = data.lista;
      
      // Filtrar solo los helados sin stock (no disponibles)
      const faltantes = helados.filter(h => !h.esta_disponible);
      
      const lista = document.getElementById('lista-fabrica');
      
      if (faltantes.length === 0) {
        lista.innerHTML = '<li class="text-center text-gray-500 py-4">¡Todos los helados están en stock!</li>';
      } else {
        // Renderizar lista de helados faltantes agrupados por tipo
        lista.innerHTML = faltantes.map(h => `
          <li class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg" data-tipo="${h.tipo}">
            <span class="font-medium">${h.nombre}</span>
            <span class="text-xs text-gray-500">${h.tipo}</span>
          </li>
        `).join('');
      }
      
      // Mostrar modal
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    } catch (error) {
      console.error('Error al cargar lista de fábrica:', error);
      mostrarNotificacion('Error al cargar la lista.', 'error');
    }
  });

  // Cerrar modal con botón
  btnCerrar.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  });

  // Cerrar modal al hacer click fuera del contenido
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });
}

/**
 * Convierte nombres de colores a sus valores hexadecimales
 * @param {string} color - Nombre del color en español
 * @returns {string} Valor hexadecimal del color
 */
function obtenerColorHex(color) {
  const colores = {
    'blanco': '#F5F5F5',
    'crema': '#FFFDD0',
    'amarillo': '#FFD700',
    'naranja': '#FF8C00',
    'rosa': '#FF69B4',
    'rojo': '#DC143C',
    'marron': '#8B4513',
    'marrón': '#8B4513',
    'negro': '#1a1a1a',
    'verde': '#32CD32',
    'celeste': '#87CEEB',
    'azul': '#4169E1',
    'violeta': '#8A2BE2',
    'morado': '#9932CC',
    'lavanda': '#E6E6FA',
    'suela': '#D2B48C',
    'cacao': '#6B4423'
  };
  return colores[color.toLowerCase().trim()] || '#DC2626';
}

/**
 * Muestra una notificación temporal en la parte superior de la pantalla
 * @param {string} mensaje - Texto a mostrar
 * @param {string} tipo - Tipo de notificación: 'success', 'error', 'warning'
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
  // Crear elemento de notificación
  const notificacion = document.createElement('div');
  notificacion.className = `fixed top-4 right-4 px-6 py-3 rounded-xl shadow-2xl z-50 animate-slide-up ${
    tipo === 'success' ? 'bg-green-600 text-white' :
    tipo === 'error' ? 'bg-red-600 text-white' :
    tipo === 'warning' ? 'bg-orange-500 text-white' :
    'bg-blue-600 text-white'
  }`;
  notificacion.textContent = mensaje;
  
  // Agregar al DOM
  document.body.appendChild(notificacion);
  
  // Eliminar después de 3 segundos
  setTimeout(() => {
    notificacion.classList.remove('animate-slide-up');
    notificacion.classList.add('animate-fade-out');
    setTimeout(() => notificacion.remove(), 300);
  }, 3000);
}
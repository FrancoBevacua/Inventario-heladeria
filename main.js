const API_URL = 'https://inventario-heladeria-backend.onrender.com/helados';

document.addEventListener('DOMContentLoaded', () => {
  cargarHelados();
  configurarBotonesFiltros();
  configurarFormulario();
  configurarModalFabrica();
});

async function cargarHelados() {
  try {
    const response = await fetch(API_URL);
    const helados = await response.json();
    renderizarHelados(helados);
    actualizarStats(helados);
  } catch (error) {
    console.error('Error al cargar helados:', error);
  }
}

function renderizarHelados(helados, filtro = 'todos') {
  const grid = document.getElementById('helados-grid');
  grid.innerHTML = '';

  const filtrados = filtro === 'todos' 
    ? helados 
    : helados.filter(h => h.tipo === filtro);

  filtrados.forEach(helado => {
    const card = document.createElement('div');
    card.className = `glass rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all card-hover border-l-4 ${helado.esta_disponible ? 'border-blue-500' : 'border-orange-400 bg-orange-50/50'} ${!helado.esta_disponible ? 'opacity-75' : ''}`;
    card.style = `--helado-color: ${obtenerColorHex(helado.color)}`;

    card.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-full shadow-lg flex-shrink-0" style="background: ${obtenerColorHex(helado.color)}"></div>
        <div class="flex-1 min-w-0">
          <h3 class="font-display font-bold text-lg text-gray-800 truncate">${helado.nombre}</h3>
          <p class="text-xs text-gray-500 uppercase tracking-wide">${helado.color}</p>
          <span class="inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full ${helado.esta_disponible ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}">
            ${helado.esta_disponible ? 'Disponible' : 'No disponible'}
          </span>
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <button onclick="toggleDisponibilidad(${helado.id}, ${!helado.esta_disponible})" 
          class="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${helado.esta_disponible ? 'text-orange-600 hover:border-orange-400 hover:bg-orange-50' : 'text-blue-600 hover:border-blue-400 hover:bg-blue-50'}">
          ${helado.esta_disponible ? 'Marcar Falta' : 'Marcar Disponible'}
        </button>
        <button onclick="eliminarHelado(${helado.id})" class="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors">
          ×
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function actualizarStats(helados) {
  const total = helados.length;
  const disponibles = helados.filter(h => h.esta_disponible).length;
  const faltantes = total - disponibles;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-disponibles').textContent = disponibles;
  document.getElementById('stat-faltantes').textContent = faltantes;
}

function configurarBotonesFiltros() {
  const buttons = document.querySelectorAll('.filtro-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      buttons.forEach(b => {
        b.classList.remove('bg-red-700', 'text-white', 'active');
        b.classList.add('bg-white', 'text-gray-600');
      });
      btn.classList.add('bg-red-700', 'text-white', 'active');
      btn.classList.remove('bg-white', 'text-gray-600');

      const tipo = btn.dataset.tipo;
      try {
        const response = await fetch(API_URL);
        const helados = await response.json();
        renderizarHelados(helados, tipo);
      } catch (error) {
        console.error('Error al filtrar:', error);
      }
    });
  });
}

function configurarFormulario() {
  const btnAgregar = document.getElementById('btn-agregar');
  btnAgregar.addEventListener('click', async () => {
    const nombre = document.getElementById('input-nombre').value.trim();
    const color = document.getElementById('input-color').value.trim();
    const tipo = document.getElementById('input-tipo').value;

    if (!nombre || !color) {
      alert('Por favor completá nombre y color');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          color,
          tipo,
          esta_disponible: true
        })
      });

      if (response.ok) {
        document.getElementById('input-nombre').value = '';
        document.getElementById('input-color').value = '';
        cargarHelados();
      }
    } catch (error) {
      console.error('Error al agregar helado:', error);
    }
  });
}

async function toggleDisponibilidad(id, disponible) {
  try {
    const response = await fetch(API_URL);
    const helados = await response.json();
    const helado = helados.find(h => h.id === id);
    
    await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        helado_id: id,
        nombre: helado.nombre,
        color: helado.color,
        tipo: helado.tipo,
        esta_disponible: disponible
      })
    });
    cargarHelados();
  } catch (error) {
    console.error('Error al actualizar:', error);
  }
}

async function eliminarHelado(id) {
  if (!confirm('¿Estás seguro de eliminar este gusto?')) return;
  
  try {
    await fetch(`${API_URL}?helado_id=${id}`, { method: 'DELETE' });
    cargarHelados();
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
}

function configurarModalFabrica() {
  const btnFabrica = document.getElementById('btn-fabrica');
  const modal = document.getElementById('modal-fabrica');
  const btnCerrar = document.getElementById('btn-cerrar-modal');

  btnFabrica.addEventListener('click', async () => {
    const response = await fetch(API_URL);
    const helados = await response.json();
    const faltantes = helados.filter(h => !h.esta_disponible);
    
    const lista = document.getElementById('lista-fabrica');
    lista.innerHTML = faltantes.map(h => `
      <li class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg" data-tipo="${h.tipo}">
        <span class="font-medium">${h.nombre}</span>
        <span class="text-xs text-gray-500">${h.tipo}</span>
      </li>
    `).join('');
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });

  btnCerrar.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });
}

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
    ' cacao': '#6B4423'
  };
  return colores[color.toLowerCase()] || '#DC2626';
}
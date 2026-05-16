import React, { useState, useMemo } from 'react';

const PALETA_SABORES = {
  blanco: '#F5F5F5', crema: '#FFFDD0', amarillo: '#FFD700', naranja: '#FF8C00',
  rosa: '#FF69B4', rojo: '#DC143C', marron: '#8B4513', marrón: '#8B4513',
  negro: '#1a1a1a', verde: '#32CD32', celeste: '#87CEEB', azul: '#4169E1',
  violeta: '#8A2BE2', morado: '#9932CC', lavanda: '#E6E6FA', suela: '#D2B48C', cacao: '#6B4423'
};

const resolveHex = (colorName) => PALETA_SABORES[colorName.toLowerCase().trim()] || '#94A3B8';

export default function Inventario({ helados, onToggle, onDelete }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const categorias = ['Todos', 'Cremas', 'Dulces', 'Chocolates', 'Agua', 'Especialidad'];

  const heladosFiltrados = useMemo(() => {
    if (categoriaSeleccionada === 'Todos') return helados;
    return helados.filter(h => h.tipo === categoriaSeleccionada);
  }, [helados, categoriaSeleccionada]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filtros */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Familias de Sabores</label>
        <div className="flex flex-wrap gap-2">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaSeleccionada(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                categoriaSeleccionada === cat 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grilla */}
      {heladosFiltrados.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400 font-medium">
          No hay registros de tipo "{categoriaSeleccionada}" en el mostrador.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {heladosFiltrados.map(helado => {
            const colorHex = resolveHex(helado.color);
            return (
              <div 
                key={helado.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
              >
                {/* Indicador de Color */}
                <div className="h-2 w-full" style={{ backgroundColor: colorHex }} />

                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base leading-tight font-display group-hover:text-blue-600 transition-colors">
                        {helado.nombre}
                      </h4>
                      <p className="text-xs text-slate-400 font-semibold uppercase mt-1 tracking-wider">
                        {helado.tipo}
                      </p>
                    </div>
                    <div 
                      className="w-5 h-5 rounded-full border border-slate-200 shadow-inner flex-shrink-0"
                      style={{ backgroundColor: colorHex }}
                      title={`Identificador visual: ${helado.color}`}
                    />
                  </div>

                  <div className="mt-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${
                      helado.esta_disponible 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${helado.esta_disponible ? 'bg-blue-600' : 'bg-red-600'}`}></span>
                      {helado.esta_disponible ? 'En Mostrador' : 'Agotado'}
                    </span>
                  </div>
                </div>

                {/* Botonera de Acciones Rápidas */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                  <button 
                    onClick={() => onToggle(helado.id, !helado.esta_disponible)}
                    className={`flex-1 text-xs font-bold py-2 px-3 rounded-xl transition-colors border ${
                      helado.esta_disponible 
                        ? 'bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300' 
                        : 'bg-blue-600 text-white border-transparent hover:bg-blue-700'
                    }`}
                  >
                    {helado.esta_disponible ? 'Quitar Stock' : 'Reponer'}
                  </button>
                  
                  <button 
                    onClick={() => onDelete(helado.id)}
                    className="p-2 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-xl border border-slate-200 transition-colors"
                    title="Eliminar Sabor"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
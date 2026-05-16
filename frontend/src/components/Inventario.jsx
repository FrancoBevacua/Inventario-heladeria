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
      {/* Filtros por Familias */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-100 uppercase tracking-wider">Familias de Sabores</label>
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

      {/* Contenedor en Filas Estiradas */}
      {heladosFiltrados.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400 font-medium">
          No hay registros de tipo "{categoriaSeleccionada}" en el mostrador.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {heladosFiltrados.map(helado => {
            const colorHex = resolveHex(helado.color);
            return (
              <div 
                key={helado.id} 
                className="bg-white/95 backdrop-blur-md border-2 border-white rounded-xl shadow-xl shadow-blue-950/50 overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 transition-all duration-150 hover:shadow-md hover:border-slate-300 relative group"
              >
                {/* Indicador de Color Lateral (Borde Estirado Izquierdo) */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 border border-r-slate-800" style={{ backgroundColor: colorHex }} />

                {/* Sección Izquierda: Identificador de Color + Texto Principal */}
                <div className="flex items-center gap-4 pl-2 flex-1 min-w-0">
                  <div 
                    className="w-6 h-6 rounded-full border border-slate-200 shadow-inner flex-shrink-0 hidden xs:block"
                    style={{ backgroundColor: colorHex }}
                    title={`Color: ${helado.color}`}
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors truncate">
                      {helado.nombre}
                    </h4>
                    <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">
                      {helado.tipo} — <span className="lowercase italic font-normal text-slate-400">{helado.color}</span>
                    </p>
                  </div>
                </div>

                {/* Sección Central: Badge de Stock de lectura rápida */}
                <div className="flex-shrink-0 sm:px-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                    helado.esta_disponible 
                      ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                      : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${helado.esta_disponible ? 'bg-blue-600' : 'bg-red-600'}`}></span>
                    {helado.esta_disponible ? 'En Mostrador' : 'Agotado'}
                  </span>
                </div>

                {/* Sección Derecha: Botonera Compacta */}
                <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
                  <button 
                    onClick={() => onToggle(helado.id, !helado.esta_disponible)}
                    className={`text-xs font-bold py-2 px-4 rounded-xl transition-colors border w-full sm:w-32 text-center ${
                      helado.esta_disponible 
                        ? 'bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300' 
                        : 'bg-blue-600 text-white border-transparent hover:bg-blue-700'
                    }`}
                  >
                    {helado.esta_disponible ? 'Quitar Stock' : 'Reponer'}
                  </button>
                  
                  <button 
                    onClick={() => onDelete(helado.id)}
                    className="p-2 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-xl border border-slate-200 transition-colors flex-shrink-0"
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
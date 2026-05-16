import React, { useMemo } from 'react';

export default function Resumen({ helados, setActiveTab }) {
  const metrics = useMemo(() => {
    const total = helados.length;
    const disponibles = helados.filter(h => h.esta_disponible).length;
    return {
      total,
      disponibles,
      faltantes: total - disponibles
    };
  }, [helados]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Balance Operacional</h2>
        <p className="text-slate-500 text-sm">Estado logístico de la pizarra en tiempo real.</p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Gustos</span>
            <div className="text-4xl font-extrabold text-slate-900 mt-1 font-display">{metrics.total}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl">🍨</div>
        </div>

        <div className="bg-white border border-blue-100 p-6 rounded-2xl shadow-sm border-l-4 border-l-blue-600 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">Disponibles</span>
            <div className="text-4xl font-extrabold text-blue-600 mt-1 font-display">{metrics.disponibles}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">🟢</div>
        </div>

        <div className="bg-white border border-red-100 p-6 rounded-2xl shadow-sm border-l-4 border-l-red-600 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Faltantes en Mostrador</span>
            <div className="text-4xl font-extrabold text-red-600 mt-1 font-display">{metrics.faltantes}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-2xl">🚨</div>
        </div>

      </div>

      {/* Acceso directo operacional */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-bold text-lg font-display">¿Reabastecer o auditar stock?</h3>
          <p className="text-blue-100 text-sm">Entrá al listado interactivo para dar de baja sabores agotados o reactivar los que acaban de entrar de fábrica.</p>
        </div>
        <button 
          onClick={() => setActiveTab('inventario')}
          className="bg-white hover:bg-slate-50 text-blue-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex-shrink-0"
        >
          Gestionar Inventario →
        </button>
      </div>
    </div>
  );
}
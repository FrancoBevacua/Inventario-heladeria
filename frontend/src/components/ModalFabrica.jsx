import React from 'react';

export default function ModalFabrica({ isOpen, onClose, helados }) {
  if (!isOpen) return null;

  const faltantes = helados.filter(h => !h.esta_disponible);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        
        {/* Cabecera del Modal */}
        <div className="bg-slate-950 text-white p-5 flex justify-between items-center print:hidden">
          <div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider font-sans">Orden de Producción</span>
            <h3 className="text-xl font-bold font-display">Sabores Solicitados</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Vista Impresa / Listado */}
        <div className="p-6">
          <div className="hidden print:block mb-6">
            <h2 className="text-xl font-bold text-black font-display">HELADERÍA - REMITO DE PRODUCCIÓN</h2>
            <p className="text-xs text-slate-500 font-medium">Fecha: {new Date().toLocaleDateString()}</p>
            <hr className="my-4 border-slate-300" />
          </div>

          {faltantes.length === 0 ? (
            <div className="text-center py-8 text-slate-400 font-medium text-sm">
              ✨ No se registran quiebres de stock. ¡Mostrador completo!
            </div>
          ) : (
            <>
              <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1 print:max-h-none print:overflow-visible">
                {faltantes.map(h => (
                  <li key={h.id} className="py-3 flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-900">{h.nombre}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                      {h.tipo}
                    </span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => window.print()}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-950 text-slate-950 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors print:hidden"
              >
                🖨️ Imprimir Pedido
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
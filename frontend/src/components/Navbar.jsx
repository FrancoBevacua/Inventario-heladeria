import React from 'react';

export default function Navbar({ activeTab, setActiveTab, onOpenModal }) {
  const navigationItems = [
    { id: 'resumen', label: 'Resumen', icon: '📊' },
    { id: 'inventario', label: 'Inventario de Gustos', icon: '🍦' },
    { id: 'agregar', label: 'Agregar Nuevo', icon: '✨' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Identidad del Sistema */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center shadow-md shadow-blue-100">
              <span className="text-xl text-white">🍦</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 font-display">Heladería Control</h1>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Gestión de Stock</p>
            </div>
          </div>

          {/* Selector de Pestañas (Tabs) */}
          <nav className="flex bg-slate-100 p-1 rounded-xl">
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Botón de Acción Lateral */}
          <button 
            onClick={onOpenModal}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-red-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            📋 Lista Fábrica
          </button>
        </div>
      </div>
    </header>
  );
}
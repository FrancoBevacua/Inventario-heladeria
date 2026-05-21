import React, { useState } from 'react';

export default function FormularioGusto({ onAgregar }) {
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('');
  const [tipo, setTipo] = useState('Cremas');
  const [fecha_elaboracion, setFecha] = useState('00-00-0000');
  const [cantidad_baldes, setCantidad] = useState(1);

  const ejecutarEnvio = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !color.trim()) return;

    onAgregar({
      nombre: nombre.trim(),
      color: color.trim(),
      tipo: tipo,
      fecha_elaboracion: fecha_elaboracion,
      cantidad_baldes: cantidad_baldes
    });

    setNombre('');
    setColor('');
    setTipo('Cremas');
    setFecha('00-00-0000');
    setCantidad(1);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      <div className="p-6 bg-slate-900 text-white">
        <h3 className="text-lg font-bold font-display">Alta de Sabores</h3>
        <p className="text-slate-400 text-xs mt-0.5">El sabor ingresará al sistema configurado como "Disponible".</p>
      </div>

      <form onSubmit={ejecutarEnvio} className="p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Comercial</label>
          <input 
            type="text" 
            required
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-900"
            placeholder="Ej: Mousse de Chocolate"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Etiqueta de Color</label>
            <input 
              type="text" 
              required
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-900"
              placeholder="Ej: Marron, Crema, Rojo..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Familia</label>
            <select 
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-700 bg-white cursor-pointer"
            >
              <option value="Cremas">Cremas</option>
              <option value="Dulces">Dulces</option>
              <option value="Chocolates">Chocolates</option>
              <option value="Agua">Agua</option>
              <option value="Especialidad">Especialidad</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha de elaboración</label>
            <input
              type="date"
              required
              value={fecha_elaboracion}
              onChange={e => setFecha(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-700 bg-white cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cantidad de baldes</label>
            <input
              type="number"
              required
              value={cantidad_baldes}
              onChange={e => setCantidad(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-700 bg-white cursor-pointer"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl shadow-md shadow-blue-100 transition-all active:scale-[0.99] text-sm tracking-wide mt-2"
        >
          🚀 Registrar Sabor
        </button>
      </form>
    </div>
  );
}
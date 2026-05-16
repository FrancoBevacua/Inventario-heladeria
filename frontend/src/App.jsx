import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import Resumen from './components/Resumen';
import Inventario from './components/Inventario';
import FormularioGusto from './components/FormularioGusto';
import ModalFabrica from './components/ModalFabrica';
import Notification from './components/Notification';

const API_URL = 'https://inventario-heladeria-backend.onrender.com/helados';

export default function App() {
  const [helados, setHelados] = useState([]);
  const [activeTab, setActiveTab] = useState('resumen'); // 'resumen' | 'inventario' | 'agregar'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sistema de feedback visual (Toasts)
  const showToast = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // GET: Cargar helados desde el backend
  const cargarHelados = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setHelados(data.lista || []);
    } catch (error) {
      console.error(error);
      showToast('Error al sincronizar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    cargarHelados();
  }, [cargarHelados]);

  // PUT: Cambiar disponibilidad (Mantiene contrato original por Query Params)
  const toggleDisponibilidad = async (id, disponible) => {
    const helado = helados.find(h => h.id === id);
    if (!helado) return;

    try {
      const url = `${API_URL}?helado_id=${id}&nombre=${encodeURIComponent(helado.nombre)}&color=${encodeURIComponent(helado.color)}&tipo=${helado.tipo}&esta_disponible=${disponible}`;
      const response = await fetch(url, { method: 'PUT' });

      if (response.ok) {
        setHelados(prev => prev.map(h => h.id === id ? { ...h, esta_disponible: disponible } : h));
        showToast(
          disponible ? `¡${helado.nombre} ya está disponible!` : `${helado.nombre} marcado como faltante`, 
          disponible ? 'success' : 'warning'
        );
      } else {
        showToast('No se pudo actualizar el estado en el servidor', 'error');
      }
    } catch (error) {
      showToast('Error de red al intentar actualizar', 'error');
    }
  };

  // DELETE: Eliminar un gusto del sistema
  const eliminarHelado = async (id) => {
    const helado = helados.find(h => h.id === id);
    if (!helado || !window.confirm(`¿Estás seguro de eliminar "${helado.nombre}" permanentemente?`)) return;

    try {
      const response = await fetch(`${API_URL}?helado_id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setHelados(prev => prev.filter(h => h.id !== id));
        showToast('Sabor removido del catálogo', 'success');
      } else {
        showToast('Error al intentar eliminar', 'error');
      }
    } catch (error) {
      showToast('Error de red al procesar la baja', 'error');
    }
  };

  // POST: Dar de alta un gusto
  const agregarHelado = async (nuevoHelado) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...nuevoHelado, esta_disponible: true })
      });

      if (response.ok) {
        await cargarHelados(); // Recarga limpia de la lista para obtener el ID asignado
        showToast('¡Nuevo sabor registrado con éxito!', 'success');
        setActiveTab('inventario'); // Transición fluida a la grilla
      } else {
        showToast('El servidor rechazó el nuevo registro', 'error');
      }
    } catch (error) {
      showToast('Error de comunicación con el backend', 'error');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 antialiased">
      {notification && <Notification message={notification.message} type={notification.type} />}
      
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenModal={() => setIsModalOpen(true)} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-red-600"></div>
            <p className="text-slate-400 text-sm font-medium animate-pulse">Sincronizando existencias...</p>
          </div>
        ) : (
          <div className="transition-all duration-300 ease-in-out">
            {activeTab === 'resumen' && <Resumen helados={helados} setActiveTab={setActiveTab} />}
            {activeTab === 'inventario' && (
              <Inventario 
                helados={helados} 
                onToggle={toggleDisponibilidad} 
                onDelete={eliminarHelado} 
              />
            )}
            {activeTab === 'agregar' && <FormularioGusto onAgregar={agregarHelado} />}
          </div>
        )}
      </main>

      <ModalFabrica 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        helados={helados} 
      />
    </div>
  );
}
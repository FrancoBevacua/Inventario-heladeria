// Importamos React y los hooks necesarios (useState, useEffect, useCallback, useMemo)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Importamos los íconos de la librería lucide-react para la interfaz visual
import { 
    ArrowRight, ArrowLeft, Pencil, Trash2, 
    IceCream, Plus, Calendar, X, 
    SlidersHorizontal 
} from 'lucide-react';

// URL principal de tu API (FastAPI) extraída de tu App.jsx original
const API_URL = 'https://inventario-heladeria-backend.onrender.com/helados';

// Diccionario visual de colores. Si el backend envía "Marron", usamos su código Hex.
// Si el backend envía directamente un Hex, la app también sabrá leerlo dinámicamente más abajo.
const COLOR_MAP = {
    'Blanco': '#FFFFFF',
    'Negro': '#1A1A1A',
    'Marron': '#7A431D',
    'Amarillo': '#FCD34D',
    'Rosa': '#F472B6',
    'Verde': '#4ADE80'
};

// Declaramos el componente principal que se exportará
export default function InventorySaaSDashboard() {
    
    // ESTADOS PRINCIPALES DE LA APLICACIÓN
    // items almacenará la lista de helados que viene del backend (reemplaza a setHelados)
    const [items, setItems] = useState([]);
    // activeTab controla si vemos la columna del Pozo o la del Despacho
    const [activeTab, setActiveTab] = useState('pozo'); 
    // Controla la apertura y cierre del Modal principal (Altas y Ediciones)
    const [modalOpen, setModalOpen] = useState(false);
    // Guarda el helado que se está editando en ese momento (null si es una creación nueva)
    const [editingItem, setEditingItem] = useState(null);
    // Guarda los datos temporales cuando hacemos clic en la flechita para traspasar baldes
    const [transferData, setTransferData] = useState(null);
    
    // ESTADOS DE RED Y FEEDBACK (Extraídos de tu App.jsx antiguo)
    // loading muestra el spinner mientras esperamos que FastAPI responda
    const [loading, setLoading] = useState(false);
    // notification guarda los mensajes de éxito/error para mostrarlos tipo "Toast"
    const [notification, setNotification] = useState(null);

    // ESTADOS DEL MENÚ LATERAL (Filtros)
    // Texto escrito en el buscador
    const [search, setSearch] = useState('');
    // Categoría/Tipo seleccionado en el dropdown
    const [selectedCategory, setSelectedCategory] = useState('todos');
    // Color seleccionado en el dropdown
    const [selectedColor, setSelectedColor] = useState('todos');
    // Método de ordenación seleccionado
    const [sortBy, setSortBy] = useState('viejos'); 

    // --- SISTEMA DE NOTIFICACIONES ---
    // Función para mostrar alertas temporales (desaparecen a los 3 segundos)
    const showToast = useCallback((message, type = 'info') => {
        // Configuramos el mensaje y el estilo (success, error, warning)
        setNotification({ message, type });
        // Limpiamos la notificación luego de 3000 milisegundos
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // --- CONSUMO DE LA API (GET) ---
    // Función asíncrona para traer los helados desde FastAPI
    const cargarHelados = useCallback(async () => {
        // Encendemos el estado de carga para mostrar el spinner
        setLoading(true);
        try {
            // Hacemos la petición GET a la API
            const response = await fetch(API_URL);
            // Si el servidor falla (404, 500), lanzamos un error
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            // Convertimos la respuesta a JSON
            const data = await response.json();
            // Guardamos la información en nuestro estado principal
            setItems(data || []);
        } catch (error) {
            // Si hay error de red, lo avisamos
            showToast('Error al sincronizar con el servidor', 'error');
        } finally {
            // Apagamos el estado de carga
            setLoading(false);
        }
    }, [showToast]);

    // useEffect ejecuta cargarHelados una única vez cuando la app arranca
    useEffect(() => {
        cargarHelados();
    }, [cargarHelados]);

    // --- GENERACIÓN DINÁMICA DE OPCIONES PARA FILTROS ---
    // En lugar de escribir a mano las opciones, extraemos de la base de datos actual:
    // Creamos un Set (para evitar duplicados) con todos los tipos ("Cremas", "Agua", etc.) existentes en la DB.
    const dbTipos = useMemo(() => [...new Set(items.map(i => i.tipo))], [items]);
    // Extraemos todos los colores únicos ("Blanco", "Marron", etc.) existentes en la DB.
    const dbColores = useMemo(() => [...new Set(items.map(i => i.color))], [items]);
    // Extraemos todos los nombres únicos para usarlos si fuera necesario.
    const dbNombres = useMemo(() => [...new Set(items.map(i => i.nombre))], [items]);

    // --- MOTOR DE FILTRADO Y ORDENACIÓN ---
    // useMemo recalcula la lista visible solo cuando los filtros o los items cambian (Optimización de React)
    const filteredItems = useMemo(() => {
        // Primero, filtramos el arreglo original
        return items
            .filter(item => {
                // Verificamos si el helado tiene lotes en la pestaña activa ('pozo' o 'despacho')
                // Nota: Convertimos a minúsculas porque en DB puede venir como "Pozo" (Ubicacion Enum)
                const hasBatchesInLocation = item.lotes?.some(b => b.ubicacion?.toLowerCase() === activeTab);
                // Comparamos el nombre escrito en el buscador (ignorando mayúsculas/minúsculas)
                const matchesSearch = item.nombre.toLowerCase().includes(search.toLowerCase());
                // Validamos si la categoría coincide, o si el usuario seleccionó 'todos'
                const matchesCategory = selectedCategory === 'todos' || item.tipo === selectedCategory;
                // Validamos el color seleccionado
                const matchesColor = selectedColor === 'todos' || item.color === selectedColor;

                // Solo pasa el filtro si cumple TODAS las condiciones anteriores
                return hasBatchesInLocation && matchesSearch && matchesCategory && matchesColor;
            })
            // Segundo, ordenamos el arreglo ya filtrado
            .sort((a, b) => {
                // Si la ordenación es alfabética, usamos localeCompare
                if (sortBy === 'alfabetico') return a.nombre.localeCompare(b.nombre);

                // Función auxiliar que busca la fecha del lote más viejo de un helado
                const getOldestDate = (flavor) => {
                    // Solo revisamos lotes de la ubicación actual
                    const locBatches = flavor.lotes?.filter(b => b.ubicacion?.toLowerCase() === activeTab) || [];
                    // Si no tiene lotes, enviamos la fecha actual por defecto
                    if (locBatches.length === 0) return new Date();
                    // Obtenemos la fecha mínima entre todos los lotes
                    return new Date(Math.min(...locBatches.map(b => new Date(b.fecha_elaboracion))));
                };

                // Conseguimos las fechas representativas para el helado A y B
                const dateA = getOldestDate(a);
                const dateB = getOldestDate(b);

                // Si es 'viejos', ordenamos de menor (viejo) a mayor. Si no, al revés.
                return sortBy === 'viejos' ? dateA - dateB : dateB - dateA;
            });
    }, [items, activeTab, search, selectedCategory, selectedColor, sortBy]);

    // --- LÓGICA DE TRASPASOS ---
    // Función que se activa al tocar la flecha de la tabla, abre el modal
    const handleOpenTransfer = (flavorId, batchId, maxQty, currentLocation) => {
        // Carga los datos del lote y predetermina qtyToMove a 1
        setTransferData({ flavorId, batchId, maxQty, currentLocation, qtyToMove: 1 });
    };

    // CONSUMO DE API (POST): Función que envía el traspaso al backend
    const executeTransfer = async () => {
        // Desestructuramos el ID del lote y la cantidad elegida
        const { batchId, qtyToMove } = transferData;
        try {
            // Hacemos el fetch al endpoint de traspaso que enviaste en helados.py
            const response = await fetch(`${API_URL}/lotes/traspasar`, {
                method: 'POST', // Método de la petición
                headers: { 'Content-Type': 'application/json' }, // Indicamos que enviamos JSON
                // Convertimos el cuerpo de la petición (RequestTraspaso model en backend)
                body: JSON.stringify({ lote_id: batchId, cantidad_a_mover: qtyToMove })
            });

            // Si hay error en la petición HTTP
            if (!response.ok) throw new Error("Error al traspasar el lote en el servidor");
            
            // Si es exitoso, mostramos el Toast positivo
            showToast("Traspaso ejecutado correctamente", "success");
            // Cerramos el modal de traspaso limpiando su estado
            setTransferData(null);
            // Volvemos a traer toda la info de la base de datos para reflejar los cambios
            await cargarHelados();
        } catch (error) {
            // Notificamos si algo explotó en el proceso
            showToast(error.message, "error");
        }
    };

    // CONSUMO DE API (POST/PUT): Guardar un nuevo helado o editarlo
    const handleSaveItem = async (formData) => {
        try {
            if (editingItem) {
                // MODO EDICIÓN (PUT)
                // Tu endpoint actual de PUT utiliza Query Params (URL). 
                // Extraemos la fecha del primer lote como fallback.
                const fallbackLote = formData.lotes[0] || { fecha_elaboracion: formData.fecha_elaboracion, cantidad_baldes: formData.cantidad_baldes };
                
                // Construimos los parámetros de la URL
                const params = new URLSearchParams({
                    helado_id: editingItem.id, // ID del helado a editar
                    nombre: formData.nombre,
                    color: formData.color,
                    tipo: formData.tipo,
                    esta_disponible: true, // Se mantiene el estado disponible
                    fecha_elaboracion: fallbackLote.fecha_elaboracion,
                    cantidad_baldes: fallbackLote.cantidad_baldes
                });

                // Ejecutamos el PUT hacia la URL concatenada con los parámetros
                const response = await fetch(`${API_URL}?${params.toString()}`, { method: 'PUT' });
                if (!response.ok) throw new Error("Error actualizando en el servidor");
                showToast("Helado modificado con éxito", "success");

            } else {
                // MODO CREACIÓN (POST)
                // Creamos el objeto principal del helado
                const nuevoHeladoPayload = {
                    nombre: formData.nombre,
                    color: formData.color,
                    tipo: formData.tipo,
                    // Anidamos el lote inicial (esto depende de que SQLModel permita inserciones anidadas)
                    lotes: [{
                        fecha_elaboracion: formData.fecha_elaboracion,
                        cantidad_baldes: formData.cantidad_baldes,
                        // Capitalizamos para que coincida con el backend Enum (ej. "Pozo")
                        ubicacion: formData.ubicacion.charAt(0).toUpperCase() + formData.ubicacion.slice(1)
                    }]
                };

                // Hacemos el POST normal
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoHeladoPayload)
                });
                if (!response.ok) throw new Error("Error creando el helado");
                showToast("Sabor registrado exitosamente", "success");
            }

            // Cerramos el formulario principal
            setModalOpen(false);
            // Limpiamos la variable de edición
            setEditingItem(null);
            // Refrescamos datos para que el nuevo helado tenga ID y aparezca
            await cargarHelados();
        } catch (error) {
            // Atrapamos errores en POST/PUT
            showToast(error.message, "error");
        }
    };

    // CONSUMO DE API (DELETE): Eliminar sabor
    const eliminarHelado = async (id, nombre) => {
        // Usamos window.confirm para validar antes de borrar
        if (!window.confirm(`¿Seguro que querés eliminar el sabor "${nombre}" y todos sus lotes?`)) return;
        try {
            // El endpoint recibe el ID por URL en DELETE
            const response = await fetch(`${API_URL}?helado_id=${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error("Error al eliminar del servidor");
            
            showToast("Helado eliminado permanentemente", "success");
            // Refrescamos la tabla
            await cargarHelados();
        } catch(error) {
            // Atrapamos errores de DELETE
            showToast(error.message, "error");
        }
    };

    // --- ESTRUCTURA VISUAL (JSX) ---
    return (
        // Contenedor base
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 font-sans text-black relative">
            
            {/* COMPONENTE TOAST EN LÍNEA: Si notification existe, mostramos este cartelito flotante */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-xl text-white font-bold transition-all ${
                    notification.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
                }`}>
                    {notification.message}
                </div>
            )}

            {/* 1. MENÚ LATERAL IZQUIERDO */}
            <aside className="w-full md:w-64 bg-linear-to-l from-red-500 to-red-700 text-black p-5 flex flex-col gap-6 shrink-0 shadow-xl">
                {/* Cabecera del Logo */}
                <div className="flex items-center gap-3 px-2 border-b border-red-400/50 pb-4">
                    <div className="bg-white p-2 rounded-xl">
                        {/* Ícono de helado */}
                        <IceCream className="text-black w-5 h-5" />
                    </div>
                    <span className="font-black text-lg tracking-tight text-white">Heladería <span className="text-blue-400 font-medium text-xs block">🍦 Controlador de stock</span></span>
                </div>

                {/* Sección de Filtros */}
                <div className="flex flex-col gap-4 mt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest px-2">
                        {/* Ícono de rayitas de filtro */}
                        <SlidersHorizontal className="w-3.5 h-3.5" /> Filtros de Stock
                    </div>

                    {/* Input Buscador */}
                    <div className="px-2">
                        <label className="text-[11px] font-bold text-white block mb-1">Nombre del gusto</label>
                        <input
                            type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/10 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* Menú desplegable dinámico para Categorías/Tipos */}
                    <div className="px-2">
                        <label className="text-[11px] font-bold text-white block mb-1">Tipo de Helado</label>
                        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                                className="w-full bg-white/10 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none cursor-pointer"
                        >
                            {/* Opción predeterminada */}
                            <option value="todos" className="bg-blue-800">Todos los Tipos</option>
                            {/* Iteramos la constante que extrajo los Tipos reales de la DB */}
                            {dbTipos.map(t => <option key={t} value={t} className="bg-blue-800">{t}</option>)}
                        </select>
                    </div>

                    {/* Menú desplegable dinámico para Colores */}
                    <div className="px-2">
                        <label className="text-[11px] font-bold text-white block mb-1">Color de Etiqueta</label>
                        <select value={selectedColor} onChange={e => setSelectedColor(e.target.value)}
                                className="w-full bg-white/10 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
                        >
                            {/* Opción predeterminada */}
                            <option value="todos" className="bg-blue-800">Todos los Colores</option>
                            {/* Iteramos los colores reales traídos de la DB */}
                            {dbColores.map(col => <option key={col} value={col} className="bg-blue-800">{col}</option>)}
                        </select>
                    </div>

                    {/* Menú desplegable para el Ordenamiento */}
                    <div className="px-2">
                        <label className="text-[11px] font-bold text-white block mb-1">Clasificar por</label>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                className="w-full bg-white/10 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
                        >
                            <option value="viejos" className="bg-blue-800">Más viejos primero</option>
                            <option value="nuevos" className="bg-blue-800">Más nuevos primero</option>
                            <option value="alfabetico" className="bg-blue-800">Orden alfabético</option>
                        </select>
                    </div>
                </div>
            </aside>

            {/* 2. PANEL PRINCIPAL DERECHO */}
            <main className="flex-1 bg-linear-to-l from-blue-600 to-blue-900 p-4 sm:p-8 flex flex-col gap-6 overflow-x-hidden relative">

                {/* Si estamos cargando datos, mostramos un spinner extraído de tu antiguo App.jsx */}
                {loading && (
                    <div className="absolute inset-0 bg-blue-900/50 backdrop-blur-sm flex flex-col justify-center items-center z-40">
                        {/* Círculo animado giratorio */}
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-white"></div>
                        <p className="text-white mt-4 font-bold animate-pulse">Sincronizando inventario...</p>
                    </div>
                )}

                {/* BARRA SUPERIOR DE ACCIONES */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                    {/* Botones de Navegación Pozo/Despacho */}
                    <div className="flex bg-black/20 p-1 rounded-xl w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab('pozo')}
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'pozo' ? 'bg-white text-blue-900 shadow-lg' : 'text-slate-200 hover:text-white'}`}
                        >
                            📦 Ver Pozo
                        </button>
                        <button
                            onClick={() => setActiveTab('despacho')}
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'despacho' ? 'bg-white text-emerald-900 shadow-lg' : 'text-slate-200 hover:text-white'}`}
                        >
                            🍦 Ver Despacho
                        </button>
                    </div>

                    {/* Botón central para dar de alta nuevo helado */}
                    <button
                        onClick={() => { setEditingItem(null); setModalOpen(true); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-blue-900 hover:bg-blue-50 px-5 py-2.5 rounded-xl text-xs font-black tracking-wide shadow-md transition-all cursor-pointer"
                    >
                        {/* Ícono de suma (+) */}
                        <Plus className="w-4 h-4" /> Registrar Lote
                    </button>
                </div>

                {/* TABLA PRINCIPAL DE DATOS */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            {/* Cabecera de la tabla */}
                            <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                <th className="py-4 px-6 text-center w-12">Color</th>
                                <th className="py-4 px-6 text-center">Gusto / Sabor</th>
                                <th className="py-4 px-6 text-center">Tipo de Helado</th>
                                <th className="py-4 px-6 text-left min-w-280px">Fecha e Inventario</th>
                                <th className="py-4 px-6 text-center w-32">Total Sección</th>
                                <th className="py-4 px-6 text-center w-28">Acciones</th>
                            </tr>
                            </thead>
                            
                            {/* Cuerpo dinámico de la tabla */}
                            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                            
                            {/* Recorremos e iteramos los helados filtrados */}
                            {filteredItems.map(flavor => {
                                // Buscamos los lotes que corresponden a la ubicación seleccionada ('pozo' o 'despacho')
                                const localBatches = (flavor.lotes || [])
                                    .filter(b => b.ubicacion.toLowerCase() === activeTab)
                                    // Y los ordenamos cronológicamente
                                    .sort((a, b) => new Date(a.fecha_elaboracion) - new Date(b.fecha_elaboracion));
                                
                                // Sumamos la cantidad de baldes totales para esa fila
                                const totalQty = localBatches.reduce((acc, b) => acc + b.cantidad_baldes, 0);

                                return (
                                    <tr key={flavor.id} className="hover:bg-slate-50/80 transition-colors border-b-slate-300">
                                        
                                        {/* 1. Círculo de Color */}
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <div
                                                style={{
                                                    // Resolvemos el color. Si no está en el mapa, usamos directo el string (que puede ser un Hex)
                                                    '--borde-color-sabor': `color-mix(in srgb, ${COLOR_MAP[flavor.color] || flavor.color || '#ccc'}, black 25%)`,
                                                    backgroundColor: COLOR_MAP[flavor.color] || flavor.color || '#ccc',
                                                }}
                                                // Le asignamos Tailwind para que renderice nuestro borde dinámico
                                                className="border-4 border-(--borde-color-sabor) w-6 h-6 rounded-full mx-auto"
                                            />
                                        </td>

                                        {/* 2. Nombre del Helado */}
                                        <td className="py-4 px-6 text-center font-bold text-slate-900 whitespace-nowrap">
                                            {flavor.nombre}
                                        </td>

                                        {/* 3. Etiqueta Tipo de Helado */}
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <span className="inline-block text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full uppercase tracking-wider">
                                              {flavor.tipo}
                                            </span>
                                        </td>

                                        {/* 4. Lista de Lotes y Fechas (Flexbox) */}
                                        <td className="py-4 px-6 text-left">
                                            <div className="flex flex-wrap gap-1.5 max-w-xl">
                                                {localBatches.map((batch, idx) => (
                                                    <div
                                                        key={batch.id}
                                                        // El lote [0] (el más viejo) se marca color ambar en el pozo
                                                        className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs ${idx === 0 && activeTab === 'pozo' ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                                                    >
                                                        {/* Ícono minúsculo del calendario */}
                                                        <Calendar className="w-2 h-2 opacity-60" />
                                                        {/* Imprimimos la fecha real traída de FastAPI */}
                                                        <span>{batch.fecha_elaboracion}</span>
                                                        {/* Cantidad de baldes */}
                                                        <span className="font-black bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-800">{batch.cantidad_baldes}</span>

                                                        {/* Botón que dispara el micro-modal de traspaso */}
                                                        <button
                                                            onClick={() => handleOpenTransfer(flavor.id, batch.id, batch.cantidad_baldes, activeTab)}
                                                            className="ml-1 p-0.5 hover:bg-slate-200 rounded text-blue-600 transition-colors cursor-pointer"
                                                            title={activeTab === 'pozo' ? "Transferir a despacho" : "Transferir a pozo"}
                                                        >
                                                            {/* Cambia la flechita si estamos en pozo (Sale) o despacho (Vuelve) */}
                                                            {activeTab === 'pozo' ? <ArrowRight className="w-3 h-3 text-emerald-600" /> : <ArrowLeft className="w-3 h-3 text-blue-600" />}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>

                                        {/* 5. Total de la Sección */}
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black ${activeTab === 'pozo' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                              {totalQty} baldes
                                            </span>
                                        </td>

                                        {/* 6. Botones (Editar / Borrar) */}
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* Botón Lápiz: Abre el modal grande y le pasa el sabor actual */}
                                                <button onClick={() => { setEditingItem(flavor); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                                                {/* Botón Basurero: Dispara la función DELETE de API */}
                                                <button onClick={() => eliminarHelado(flavor.id, flavor.nombre)} className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {/* Si la tabla está vacía, mostramos esto */}
                            {filteredItems.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/50">
                                        No se encontraron helados en esta sección con los filtros aplicados
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* MODAL ESTRUCTURAL DE ALTA / EDICIÓN (Mapeamos dbTipos y dbColores internamente) */}
            {modalOpen && (
                <InventoryModal
                    item={editingItem}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSaveItem}
                    // Le pasamos las listas dinámicas de colores y tipos al Modal
                    tiposDisponibles={dbTipos}
                    coloresDisponibles={dbColores}
                />
            )}

            {/* MICRO-MODAL PARA ELEGIR TRASPASO FRACCIONADO */}
            {transferData && (
                // Fondo oscuro traslúcido
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white w-full max-w-xs rounded-2xl p-5 shadow-2xl border border-slate-100">
                        <h3 className="font-black text-slate-800 text-sm text-center mb-4">¿Cuántos baldes transferir?</h3>
                        
                        {/* Selector de cantidad (+/-) */}
                        <div className="flex items-center justify-center gap-3 mb-4">
                            {/* Botón Menos: Deshabilitado si estamos en 1 */}
                            <button
                                type="button" disabled={transferData.qtyToMove <= 1}
                                onClick={() => setTransferData({ ...transferData, qtyToMove: transferData.qtyToMove - 1 })}
                                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold disabled:opacity-40"
                            >-</button>
                            <span className="text-2xl font-black text-blue-600 w-12 text-center">{transferData.qtyToMove}</span>
                            {/* Botón Más: Deshabilitado si alcanzamos el máximo disponible del lote */}
                            <button
                                type="button" disabled={transferData.qtyToMove >= transferData.maxQty}
                                onClick={() => setTransferData({ ...transferData, qtyToMove: transferData.qtyToMove + 1 })}
                                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold disabled:opacity-40"
                            >+</button>
                        </div>

                        {/* Info de stock máximo disponible */}
                        <p className="text-[10px] text-center text-slate-400 font-bold mb-5 uppercase tracking-wider">Disponibles en este lote: {transferData.maxQty} b.</p>
                        
                        {/* Botones de acción final */}
                        <div className="grid grid-cols-2 gap-2">
                            {/* Cancela y limpia el transferData, ocultando el modal */}
                            <button onClick={() => setTransferData(null)} className="py-2 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs cursor-pointer">Cancelar</button>
                            {/* Lanza la petición a la API */}
                            <button onClick={executeTransfer} className="py-2 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-200 cursor-pointer">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- SUB-COMPONENTE AISLADO: MODAL DE FORMULARIO DE ALTA / EDICIÓN ---
function InventoryModal({ item, onClose, onSave, tiposDisponibles, coloresDisponibles }) {
    // Definimos el estado interno del formulario (mapeado de castellano para la DB)
    const [formData, setFormData] = useState({
        nombre: item?.nombre || '',
        tipo: item?.tipo || 'Cremas', // Fallback si no hay tipo
        color: item?.color || 'Blanco', 
        cantidad_baldes: 1, // Para nuevos ingresos
        fecha_elaboracion: new Date().toISOString().split('T')[0],
        ubicacion: 'pozo',
        lotes: item ? [...(item.lotes || [])] : [] // Copiamos el array de lotes si estamos editando
    });

    // Permite que un empleado edite fecha/cantidad de un lote de una edición
    const handleUpdateBatchField = (batchId, field, value) => {
        setFormData({
            ...formData,
            // Recorremos los lotes, encontramos el modificado y actualizamos el campo
            lotes: formData.lotes.map(b => b.id === batchId ? { ...b, [field]: value } : b)
        });
    };

    // Función que captura el evento Submit del formulario HTML
    const handleSubmit = (e) => {
        e.preventDefault(); // Evita recarga de página nativa
        if (!formData.nombre) return alert("Por favor, ingresá el nombre.");
        // Le mandamos los datos procesados a la función onSave del componente padre
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    {/* Título dinámico si hay o no un "item" recibido por Props */}
                    <h2 className="font-black text-md text-slate-800">{item ? 'Modificar Registro del Sabor' : 'Nueva Fabricación'}</h2>
                    {/* Botón de cierre superior (X) */}
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    
                    {/* Input Nombre */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre del Gusto</label>
                        <input
                            type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-blue-600 focus:bg-white"
                        />
                    </div>

                    {/* Grilla 50/50: Tipo y Color */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo de Helado</label>
                            {/* Selector conectado al estado formData.tipo */}
                            <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none cursor-pointer"
                            >
                                {/* Imprimimos las opciones obtenidas de la DB en el componente Padre */}
                                {tiposDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Color Etiqueta</label>
                            {/* Selector conectado a formData.color */}
                            <select value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none cursor-pointer"
                            >
                                {/* Mapeamos los colores desde la DB (Y sumamos opciones fallback clásicas por si está vacía) */}
                                {(coloresDisponibles.length ? coloresDisponibles : Object.keys(COLOR_MAP)).map(col => <option key={col} value={col}>{col}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Lógica Condicional: Si estamos editando mostramos lista de lotes, sino, datos de ingreso */}
                    {item ? (
                        <div className="space-y-2 pt-2">
                            <label className="block text-xs font-black text-blue-600 uppercase tracking-wider">Historial de Lotes Activos</label>
                            <div className="space-y-2 max-h-48 overflow-y-auto border border-dashed border-slate-200 p-2 rounded-xl bg-slate-50">
                                {/* Iteramos los lotes cargados y armamos mini-inputs por si el operario cargó mal una fecha */}
                                {formData.lotes.map((batch) => (
                                    <div key={batch.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                                        <div className="col-span-7">
                                            <input
                                                type="date"
                                                value={batch.fecha_elaboracion}
                                                // Llama a la función de modificación parcial por ID
                                                onChange={e => handleUpdateBatchField(batch.id, 'fecha_elaboracion', e.target.value)}
                                                className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded px-2 py-1 outline-none"
                                            />
                                        </div>
                                        <div className="col-span-5 flex items-center gap-1">
                                            <input
                                                type="number"
                                                value={batch.cantidad_baldes}
                                                onChange={e => handleUpdateBatchField(batch.id, 'cantidad_baldes', parseInt(e.target.value) || 0)}
                                                className="w-full text-xs font-black text-slate-800 bg-slate-50 border border-slate-100 rounded px-1.5 py-1 text-center outline-none"
                                            />
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">b.</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Interfaz de NUEVA CARGA */
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cantidad Baldes</label>
                                    <input type="number" min="1" value={formData.cantidad_baldes} onChange={e => setFormData({...formData, cantidad_baldes: parseInt(e.target.value) || 1})}
                                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Fecha de Lote</label>
                                    <input type="date" value={formData.fecha_elaboracion} onChange={e => setFormData({...formData, fecha_elaboracion: e.target.value})}
                                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                                    />
                                </div>
                            </div>

                            {/* Botonera de elección de Destino (Pozo o Despacho) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Destino Inicial</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => setFormData({...formData, ubicacion: 'pozo'})}
                                            className={`py-2.5 rounded-xl font-extrabold text-xs uppercase border-2 transition-all cursor-pointer ${formData.ubicacion === 'pozo' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                    >
                                        📦 Al Pozo
                                    </button>
                                    <button type="button" onClick={() => setFormData({...formData, ubicacion: 'despacho'})}
                                            className={`py-2.5 rounded-xl font-extrabold text-xs uppercase border-2 transition-all cursor-pointer ${formData.ubicacion === 'despacho' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                    >
                                        🍦 A Despacho
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Botón Maestro Submit (Guarda la info) */}
                    <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all mt-2 cursor-pointer">
                        {item ? 'Guardar Cambios' : 'Registrar Lote'}
                    </button>
                </form>
            </div>
        </div>
    );
}
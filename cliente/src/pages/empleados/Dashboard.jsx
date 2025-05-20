// cliente/src/components/empleados/Dashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const EmpleadoDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendientes: 0,
    procesando: 0,
    enviados: 0,
    entregados: 0
  });
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No estás autenticado');
        }
        
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Obtener estadísticas de pedidos - Modificar la ruta
        const statsRes = await axios.get('/api/pedidos/stats', config);
        
        // Obtener pedidos recientes - Modificar la ruta
        const pedidosRes = await axios.get('/api/pedidos/recientes', config);
        
        setStats(statsRes.data.data || {
          pendientes: 0,
          procesando: 0,
          enviados: 0,
          entregados: 0
        });
        setPedidosRecientes(pedidosRes.data.data || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError(err.response?.data?.message || 'Error al cargar datos');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return 'Fecha no disponible';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      procesando: 'bg-blue-100 text-blue-800',
      enviado: 'bg-purple-100 text-purple-800',
      entregado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Panel de Empleado</h1>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-400">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-600">Pendientes</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendientes}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/empleado/pedidos?estado=pendiente" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Ver todos
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-400">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-600">Procesando</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.procesando}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/empleado/pedidos?estado=procesando" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Ver todos
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-400">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-600">Enviados</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.enviados}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/empleado/pedidos?estado=enviado" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Ver todos
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-400">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-600">Entregados</h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.entregados}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/empleado/pedidos?estado=entregado" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Ver todos
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-4">
          <Link 
            to="/empleado/pedidos?estado=pendiente" 
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Procesar pedidos pendientes
          </Link>
          
          <Link 
            to="/empleado/pedidos?estado=procesando" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Despachar pedidos
          </Link>
          
          <Link 
            to="/empleado/pedidos" 
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Ver todos los pedidos
          </Link>
        </div>
      </div>
      
      {/* Pedidos recientes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Pedidos recientes</h2>
        
        {pedidosRecientes.length === 0 ? (
          <p className="text-gray-600">No hay pedidos recientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">N° Pedido</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Cliente</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Fecha</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Estado</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Total</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pedidosRecientes.map(pedido => (
                  <tr key={pedido._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium">{pedido.numeroPedido}</span>
                    </td>
                    <td className="py-3 px-4">
                      {pedido.usuario?.nombre || 'Usuario'} {pedido.usuario?.apellido || ''}
                    </td>
                    <td className="py-3 px-4">
                      {formatFecha(pedido.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(pedido.estadoPedido)}`}>
                        {pedido.estadoPedido.charAt(0).toUpperCase() + pedido.estadoPedido.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP'
                      }).format(pedido.total)}
                    </td>
                    <td className="py-3 px-4">
                      <Link 
                        to={`/empleado/pedidos/${pedido._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 text-right">
          <Link 
            to="/empleado/pedidos"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 justify-end"
          >
            Ver todos los pedidos
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmpleadoDashboard;
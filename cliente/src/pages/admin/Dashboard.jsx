// cliente/src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalPedidos: 0,
    totalUsuarios: 0,
    pedidosPendientes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
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

        // Obtener datos de diferentes endpoints
        const [productos, pedidos, usuarios] = await Promise.all([
          axios.get('/api/productos', config),
          axios.get('/api/pedidos', config),
          axios.get('/api/usuarios', config)
        ]);
        
        const pedidosPendientes = pedidos.data.data.filter(
          pedido => pedido.estadoPedido === 'pendiente'
        ).length;

        setStats({
          totalProductos: productos.data.total || 0,
          totalPedidos: pedidos.data.count || 0,
          totalUsuarios: usuarios.data.count || 0,
          pedidosPendientes
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
        setError('Error al cargar las estadísticas. Por favor, intenta nuevamente más tarde.');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tarjeta Productos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Productos</h2>
              <p className="text-2xl font-semibold">{stats.totalProductos}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/productos" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Administrar productos →
            </Link>
          </div>
        </div>
        
        {/* Tarjeta Pedidos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Pedidos</h2>
              <p className="text-2xl font-semibold">{stats.totalPedidos}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/pedidos" className="text-green-600 hover:text-green-800 text-sm font-medium">
              Administrar pedidos →
            </Link>
          </div>
        </div>
        
        {/* Tarjeta Usuarios */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Usuarios</h2>
              <p className="text-2xl font-semibold">{stats.totalUsuarios}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/usuarios" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              Administrar usuarios →
            </Link>
          </div>
        </div>
        
        {/* Tarjeta Pedidos Pendientes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Pedidos Pendientes</h2>
              <p className="text-2xl font-semibold">{stats.pedidosPendientes}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/pedidos?estado=pendiente" className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
              Ver pedidos pendientes →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Acciones rápidas</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/productos/nuevo" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-md border border-gray-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nuevo producto</span>
          </Link>
          
          <Link to="/admin/pedidos?estado=pendiente" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-md border border-gray-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Gestionar pedidos</span>
          </Link>
          
          <Link to="/admin/productos?stock=bajo" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-md border border-gray-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Stock bajo</span>
          </Link>
          
          <Link to="/admin/usuarios/nuevo" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-md border border-gray-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Crear usuario</span>
          </Link>
        </div>
      </div>
      
      {/* Últimos pedidos (ejemplo) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Últimos pedidos</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Si hay datos, mostrarían aquí. Por ahora, solo ejemplos estáticos */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">#PM-230419-12345</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Juan Pérez</div>
                  <div className="text-sm text-gray-500">juan@ejemplo.com</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">19/04/2025</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">$24.990</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pendiente
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link to="/admin/pedidos/1" className="text-primary-600 hover:text-primary-800 mr-3">
                    Ver
                  </Link>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">#PM-230419-12344</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">María González</div>
                  <div className="text-sm text-gray-500">maria@ejemplo.com</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">18/04/2025</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">$36.700</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Pagado
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link to="/admin/pedidos/2" className="text-primary-600 hover:text-primary-800 mr-3">
                    Ver
                  </Link>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">#PM-230418-12343</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Carlos Rodríguez</div>
                  <div className="text-sm text-gray-500">carlos@ejemplo.com</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">17/04/2025</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">$45.900</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Enviado
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link to="/admin/pedidos/3" className="text-primary-600 hover:text-primary-800 mr-3">
                    Ver
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <Link to="/admin/pedidos" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
            Ver todos los pedidos →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
// cliente/src/pages/admin/Orders.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const AdminOrders = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialEstadoFiltro = queryParams.get('estado') || '';

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState(initialEstadoFiltro);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Estados para edición
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingOrderStatus, setEditingOrderStatus] = useState('');
  const [editingOrderPaymentStatus, setEditingOrderPaymentStatus] = useState('');

  // Opciones para filtro de estado
  const estadosPedido = [
    { id: '', nombre: 'Todos los estados' },
    { id: 'pendiente', nombre: 'Pendiente' },
    { id: 'procesando', nombre: 'Procesando' },
    { id: 'enviado', nombre: 'Enviado' },
    { id: 'entregado', nombre: 'Entregado' },
    { id: 'cancelado', nombre: 'Cancelado' }
  ];

  useEffect(() => {
    const fetchPedidos = async () => {
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

        const res = await axios.get('/api/pedidos', config);
        setPedidos(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
        setError('Error al cargar los pedidos. Por favor, intenta nuevamente más tarde.');
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  // Formatear precio como moneda chilena
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  // Formatear fecha
  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Obtener el color para el estado del pedido
  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'yellow',
      procesando: 'blue',
      enviado: 'purple',
      entregado: 'green',
      cancelado: 'red'
    };
    
    return colores[estado] || 'gray';
  };

  // Obtener el color para el estado del pago
  const getEstadoPagoColor = (estado) => {
    const colores = {
      pendiente: 'yellow',
      pagado: 'green',
      rechazado: 'red'
    };
    
    return colores[estado] || 'gray';
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    // Filtro por texto (número de pedido)
    const matchBusqueda = pedido.numeroPedido.toLowerCase().includes(busqueda.toLowerCase());
    
    // Filtro por estado
    const matchEstado = estadoFiltro === '' || pedido.estadoPedido === estadoFiltro;
    
    // Filtro por fecha
    let matchFecha = true;
    
    if (fechaDesde) {
      const fechaDesdeObj = new Date(fechaDesde);
      const fechaPedido = new Date(pedido.createdAt);
      if (fechaPedido < fechaDesdeObj) {
        matchFecha = false;
      }
    }
    
    if (fechaHasta) {
      const fechaHastaObj = new Date(fechaHasta);
      fechaHastaObj.setHours(23, 59, 59); // Fin del día
      const fechaPedido = new Date(pedido.createdAt);
      if (fechaPedido > fechaHastaObj) {
        matchFecha = false;
      }
    }
    
    return matchBusqueda && matchEstado && matchFecha;
  });

  // Actualizar estado del pedido
  const handleUpdateOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Esta ruta es un ejemplo, deberías crearla en tu backend
      await axios.put(`/api/pedidos/${orderId}/estado`, {
        estadoPedido: editingOrderStatus,
        estadoPago: editingOrderPaymentStatus
      }, config);
      
      // Actualizar en el estado local
      setPedidos(pedidos.map(pedido => {
        if (pedido._id === orderId) {
          return {
            ...pedido,
            estadoPedido: editingOrderStatus,
            estadoPago: editingOrderPaymentStatus
          };
        }
        return pedido;
      }));
      
      // Cerrar edición
      setEditingOrderId(null);
    } catch (err) {
      console.error('Error al actualizar el pedido:', err);
      alert('Error al actualizar el pedido. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-6">Administrar Pedidos</h1>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por número
            </label>
            <input
              type="text"
              id="busqueda"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Número de pedido..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor="estadoFiltro" className="block text-sm font-medium text-gray-700 mb-1">
              Estado del pedido
            </label>
            <select
              id="estadoFiltro"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {estadosPedido.map(estado => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="fechaDesde" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha desde
            </label>
            <input
              type="date"
              id="fechaDesde"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor="fechaHasta" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha hasta
            </label>
            <input
              type="date"
              id="fechaHasta"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
      
      {/* Mensajes de estado */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No se encontraron pedidos</h2>
            <p className="text-gray-600 mb-6">Intenta con otros criterios de búsqueda.</p>
          </div>
          <button
            onClick={() => {
              setBusqueda('');
              setEstadoFiltro('');
              setFechaDesde('');
              setFechaHasta('');
            }}
            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md"
          >
            Mostrar todos los pedidos
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                {pedidosFiltrados.map((pedido) => (
                  <tr key={pedido._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {pedido.numeroPedido}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pedido.metodoPago === 'webpay' ? 'WebPay' : 
                         pedido.metodoPago === 'transferencia' ? 'Transferencia' : 
                         'Efectivo'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {pedido.usuario.nombre} {pedido.usuario.apellido}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pedido.usuario.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatFecha(pedido.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(pedido.total)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {pedido.productos.length} productos
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingOrderId === pedido._id ? (
                        <div className="space-y-2">
                          <select
                            value={editingOrderStatus}
                            onChange={(e) => setEditingOrderStatus(e.target.value)}
                            className="block w-full text-sm border-gray-300 rounded-md"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="procesando">Procesando</option>
                            <option value="enviado">Enviado</option>
                            <option value="entregado">Entregado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                          
                          <select
                            value={editingOrderPaymentStatus}
                            onChange={(e) => setEditingOrderPaymentStatus(e.target.value)}
                            className="block w-full text-sm border-gray-300 rounded-md"
                          >
                            <option value="pendiente">Pago pendiente</option>
                            <option value="pagado">Pagado</option>
                            <option value="rechazado">Rechazado</option>
                          </select>
                        </div>
                      ) : (
                        <div>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getEstadoColor(pedido.estadoPedido)}-100 text-${getEstadoColor(pedido.estadoPedido)}-800`}>
                            {pedido.estadoPedido.charAt(0).toUpperCase() + pedido.estadoPedido.slice(1)}
                          </span>
                          <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getEstadoPagoColor(pedido.estadoPago)}-100 text-${getEstadoPagoColor(pedido.estadoPago)}-800`}>
                            {pedido.estadoPago === 'pendiente' ? 'Pago pendiente' : 
                             pedido.estadoPago === 'pagado' ? 'Pagado' : 
                             'Pago rechazado'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingOrderId === pedido._id ? (
                        <div className="space-x-2">
                          <button 
                            onClick={() => handleUpdateOrder(pedido._id)} 
                            className="text-green-600 hover:text-green-900"
                          >
                            Guardar
                          </button>
                          <button 
                            onClick={() => setEditingOrderId(null)} 
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="space-x-2">
                          <button 
                            onClick={() => {
                              setEditingOrderId(pedido._id);
                              setEditingOrderStatus(pedido.estadoPedido);
                              setEditingOrderPaymentStatus(pedido.estadoPago);
                            }} 
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Editar
                          </button>
                          <Link 
                            to={`/admin/pedidos/${pedido._id}`} 
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Ver
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
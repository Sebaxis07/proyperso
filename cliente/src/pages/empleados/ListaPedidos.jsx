// cliente/src/components/empleados/ListaPedidos.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ListaPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    estado: 'todos',
    fechaDesde: '',
    fechaHasta: '',
    buscar: ''
  });
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No estás autenticado');
        }
        
        // Construir la URL de la consulta con los filtros
        let queryParams = new URLSearchParams();
        
        if (filtros.estado && filtros.estado !== 'todos') {
          queryParams.append('estado', filtros.estado);
        }
        
        if (filtros.fechaDesde) {
          queryParams.append('fechaDesde', filtros.fechaDesde);
        }
        
        if (filtros.fechaHasta) {
          queryParams.append('fechaHasta', filtros.fechaHasta);
        }
        
        if (filtros.buscar) {
          queryParams.append('buscar', filtros.buscar);
        }
        
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        const res = await axios.get(`/api/pedidos/admin/todos?${queryParams.toString()}`, config);
        
        // Ordenar pedidos: primero pendientes, luego procesando, enviado, entregado y por último cancelados
        const ordenPrioridad = {
          pendiente: 1,
          procesando: 2,
          enviado: 3,
          entregado: 4,
          cancelado: 5
        };
        
        const pedidosOrdenados = [...res.data.data].sort((a, b) => {
          // Primero ordenar por prioridad de estado
          const prioridadA = ordenPrioridad[a.estadoPedido];
          const prioridadB = ordenPrioridad[b.estadoPedido];
          
          if (prioridadA !== prioridadB) {
            return prioridadA - prioridadB;
          }
          
          // Si tienen el mismo estado, ordenar por fecha (más reciente primero)
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setPedidos(pedidosOrdenados);
        setTotalPages(Math.ceil(pedidosOrdenados.length / itemsPerPage));
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
        setError(err.response?.data?.msg || 'Error al cargar pedidos');
        setLoading(false);
      }
    };
    
    fetchPedidos();
  }, [filtros]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
    setCurrentPage(1); // Reiniciar la página al cambiar filtros
  };

  const handleSubmitFiltros = (e) => {
    e.preventDefault();
    // El efecto se encargará de recargar los datos
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: 'todos',
      fechaDesde: '',
      fechaHasta: '',
      buscar: ''
    });
    setCurrentPage(1);
  };

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  // Cambiar rápidamente el estado de un pedido
  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      await axios.put(
        `/api/pedidos/${pedidoId}/estado`,
        { estadoPedido: nuevoEstado },
        config
      );
      
      // Actualizar el estado en la lista local
      setPedidos(prev => prev.map(pedido => 
        pedido._id === pedidoId 
          ? { ...pedido, estadoPedido: nuevoEstado } 
          : pedido
      ));
      
      toast.success(`Pedido actualizado a: ${nuevoEstado}`);
    } catch (err) {
      console.error('Error al actualizar pedido:', err);
      toast.error(err.response?.data?.msg || 'Error al actualizar pedido');
    }
  };

  // Asignar un pedido al empleado actual
  const asignarPedido = async (pedidoId) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      const res = await axios.put(
        `/api/pedidos/${pedidoId}/asignar`,
        {},
        config
      );
      
      // Actualizar el pedido en la lista local
      setPedidos(prev => prev.map(pedido => 
        pedido._id === pedidoId 
          ? { ...res.data.data } 
          : pedido
      ));
      
      toast.success('Pedido asignado correctamente');
    } catch (err) {
      console.error('Error al asignar pedido:', err);
      toast.error(err.response?.data?.msg || 'Error al asignar pedido');
    }
  };

  // Solicitar cancelación de un pedido
  const solicitarCancelacion = async (pedidoId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`/api/pedidos/${pedidoId}/solicitar-cancelacion`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Solicitud de cancelación enviada al administrador');
    } catch (err) {
      console.error('Error al solicitar cancelación:', err);
      toast.error(err.response?.data?.msg || 'Error al solicitar la cancelación');
    }
  };

  // Obtener los pedidos para la página currentPage
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return pedidos.slice(indexOfFirstItem, indexOfLastItem);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
        
        <Link 
          to="/empleado/dashboard" 
          className="inline-flex items-center gap-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Volver al Panel
        </Link>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Filtrar pedidos</h2>
        
        <form onSubmit={handleSubmitFiltros} className="space-y-4 md:space-y-0 md:grid md:grid-cols-4 md:gap-4">
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="procesando">Procesando</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="fechaDesde" className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              id="fechaDesde"
              name="fechaDesde"
              value={filtros.fechaDesde}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="fechaHasta" className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              id="fechaHasta"
              name="fechaHasta"
              value={filtros.fechaHasta}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="buscar" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="flex">
              <input
                type="text"
                id="buscar"
                name="buscar"
                value={filtros.buscar}
                onChange={handleFiltroChange}
                placeholder="Número de pedido..."
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </form>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={limpiarFiltros}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
      
      {/* Tabla de pedidos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Lista de pedidos ({pedidos.length})
          </h2>
        </div>
        
        {pedidos.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <p className="text-gray-500 text-lg">No se encontraron pedidos que coincidan con los filtros aplicados.</p>
            <button
              onClick={limpiarFiltros}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Ver todos los pedidos
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">N° Pedido</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Cliente</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Fecha</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Total</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Estado</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getCurrentItems().map(pedido => (
                  <tr key={pedido._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link to={`/empleado/pedidos/${pedido._id}`} className="font-medium text-blue-600 hover:text-blue-800">
                        {pedido.numeroPedido}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      {pedido.usuario?.nombre || 'Usuario'} {pedido.usuario?.apellido || ''}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {formatFecha(pedido.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatPrice(pedido.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(pedido.estadoPedido)}`}>
                        {pedido.estadoPedido.charAt(0).toUpperCase() + pedido.estadoPedido.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link 
                          to={`/empleado/pedidos/${pedido._id}`}
                          className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                          title="Ver detalles"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        
                        {pedido.estadoPedido === 'pendiente' && (
                          <button
                            onClick={() => asignarPedido(pedido._id)}
                            className="p-1.5 bg-purple-600 text-white rounded hover:bg-purple-700"
                            title="Asignar y procesar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </button>
                        )}
                        
                        {pedido.estadoPedido === 'procesando' && (
                          <button
                            onClick={() => cambiarEstadoPedido(pedido._id, 'enviado')}
                            className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                            title="Marcar como enviado"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                          </button>
                        )}
                        
                        {pedido.estadoPedido === 'enviado' && (
                          <button
                            onClick={() => cambiarEstadoPedido(pedido._id, 'entregado')}
                            className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                            title="Marcar como entregado"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        
                        {['pendiente', 'procesando'].includes(pedido.estadoPedido) && (
                          <button
                            onClick={() => {
                              if (window.confirm('¿Estás seguro de solicitar la cancelación de este pedido?')) {
                                solicitarCancelacion(pedido._id);
                              }
                            }}
                            className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                            title="Solicitar cancelación"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Paginación */}
        {pedidos.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, pedidos.length)}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, pedidos.length)}</span> de <span className="font-medium">{pedidos.length}</span> resultados
              </p>
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Anterior
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 border border-gray-300 rounded-md ${
                    currentPage === number
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaPedidos;
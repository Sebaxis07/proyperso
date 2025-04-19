import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Orders = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/pedidos', config);
        setPedidos(res.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error al cargar los pedidos');
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);

  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstadoPedidoInfo = (estado) => {
    const estados = {
      pendiente: { color: 'yellow', text: 'Pendiente' },
      procesando: { color: 'blue', text: 'Procesando' },
      enviado: { color: 'purple', text: 'Enviado' },
      entregado: { color: 'green', text: 'Entregado' },
      cancelado: { color: 'red', text: 'Cancelado' },
    };
    return estados[estado] || { color: 'gray', text: estado };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-8">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Mis Pedidos
          <span className="ml-3 text-sm font-medium text-gray-500">
            ({pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'})
          </span>
        </h1>
        
        <Link 
          to="/productos" 
          className="inline-flex items-center px-4 py-2 bg-[#FFD15C] text-white rounded-lg hover:bg-[#FFC132] transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Hacer nuevo pedido
        </Link>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white shadow-lg rounded-xl p-8 text-center border border-gray-100">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-12 h-12 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No tienes pedidos todavía</h2>
            <p className="text-gray-600 mb-8">¡Explora nuestra tienda y encuentra productos increíbles para tu mascota!</p>
            <Link 
              to="/productos" 
              className="inline-flex items-center px-6 py-3 bg-[#FFD15C] text-white rounded-lg hover:bg-[#FFC132] transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Explorar Productos
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {pedidos.map((pedido) => {
            const estadoInfo = getEstadoPedidoInfo(pedido.estadoPedido);
            
            return (
              <div 
                key={pedido._id} 
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden group"
              >
                <Link to={`/pedidos/${pedido._id}`}>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-800">#{pedido.numeroPedido}</h3>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold
                            ${estadoInfo.color === 'yellow' && 'bg-yellow-100 text-yellow-800'}
                            ${estadoInfo.color === 'green' && 'bg-green-100 text-green-800'}
                            ${estadoInfo.color === 'blue' && 'bg-blue-100 text-blue-800'}
                            ${estadoInfo.color === 'red' && 'bg-red-100 text-red-800'}
                            ${estadoInfo.color === 'purple' && 'bg-purple-100 text-purple-800'}
                          `}>
                            {estadoInfo.text}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatFecha(pedido.createdAt)}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="font-medium text-[#FFD15C]">
                              {formatPrice(pedido.total)}
                            </div>
                            <div className="text-gray-600">
                              <span className="font-medium">{pedido.productos.length}</span> productos
                            </div>
                            <div className="text-gray-600">
                              Pago por <span className="font-medium">
                                {pedido.metodoPago === 'webpay' && 'WebPay'}
                                {pedido.metodoPago === 'transferencia' && 'Transferencia'}
                                {pedido.metodoPago === 'efectivo' && 'Efectivo'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0 md:ml-6">
                        <span className="inline-flex items-center text-[#FFD15C] group-hover:translate-x-1 transition-transform duration-200">
                          Ver detalles
                          <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Orders;
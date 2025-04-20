// cliente/src/pages/ConfirmacionReserva.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConfirmacionReserva = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerPedido = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No estás autenticado');
        }
        
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const res = await axios.get(`/api/pedidos/${id}`, config);
        setPedido(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener pedido:', err);
        setError('No se pudo cargar la información del pedido. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };

    if (id) {
      obtenerPedido();
    } else {
      setError('No se encontró el ID del pedido');
      setLoading(false);
    }
  }, [id]);

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-CL', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
          <p>{error}</p>
        </div>
        <div className="text-center mt-6">
          <Link to="/productos" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-md">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md">
          <p>No se encontró información del pedido.</p>
        </div>
        <div className="text-center mt-6">
          <Link to="/productos" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-md">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Encabezado */}
        <div className="bg-green-50 p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">¡Pedido Confirmado!</h1>
                <p className="text-gray-600">Gracias por tu compra</p>
              </div>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
              <p className="text-sm text-gray-500">Pedido #</p>
              <p className="font-bold text-gray-800">{pedido._id.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Detalles del pedido */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Información general */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Detalles del pedido</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">{formatDate(pedido.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <p className="font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                        ${pedido.estadoPedido === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                        pedido.estadoPedido === 'procesando' ? 'bg-blue-100 text-blue-800' : 
                        pedido.estadoPedido === 'enviado' ? 'bg-indigo-100 text-indigo-800' : 
                        pedido.estadoPedido === 'entregado' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}>
                        {pedido.estadoPedido.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Método de pago</p>
                    <p className="font-medium capitalize">{pedido.metodoPago}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado de pago</p>
                    <p className="font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                        ${pedido.estadoPago === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                        pedido.estadoPago === 'pagado' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}>
                        {pedido.estadoPago.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dirección de envío */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Dirección de envío</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium">{pedido.direccionEnvio.calle} {pedido.direccionEnvio.numero}</p>
                <p className="text-gray-600">{pedido.direccionEnvio.comuna}, {pedido.direccionEnvio.ciudad}</p>
                <p className="text-gray-600">{pedido.direccionEnvio.region}</p>
                {pedido.direccionEnvio.codigoPostal && (
                  <p className="text-gray-600">CP: {pedido.direccionEnvio.codigoPostal}</p>
                )}
              </div>
            </div>
          </div>

          {/* Productos */}
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Productos</h2>
          <div className="bg-gray-50 rounded-lg overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pedido.productos.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                          {item.producto.imagenUrl ? (
                            <img src={item.producto.imagenUrl} alt={item.producto.nombre} className="h-10 w-10 object-cover" />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.producto.nombre}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatPrice(item.precioUnitario)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.cantidad}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatPrice(item.subtotal)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen de costos */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 lg:w-1/3">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(pedido.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    {pedido.costoEnvio === 0 ? (
                      <span className="text-green-600 font-semibold">GRATIS</span>
                    ) : (
                      <span>{formatPrice(pedido.costoEnvio)}</span>
                    )}
                  </div>
                  <div className="border-t my-2 pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-lg">{formatPrice(pedido.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-gray-50 p-6 border-t">
          <div className="flex flex-col md:flex-row gap-4 justify-end">
            <button 
              onClick={() => navigate('/productos')}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Seguir comprando
            </button>
            
            <button 
              onClick={() => window.print()}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>
            
            <Link
              to={`/mi-cuenta/pedidos`}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
            >
              Ver mis pedidos
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mensaje extra */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-2">Recibirás un correo electrónico con los detalles de tu pedido</p>
        <p className="text-gray-700">¿Tienes alguna pregunta? <a href="/contacto" className="text-primary-600 hover:underline">Contáctanos</a></p>
      </div>
    </div>
  );
};

export default ConfirmacionReserva;
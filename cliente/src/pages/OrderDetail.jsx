// cliente/src/pages/OrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const OrderDetail = () => {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para la subida del comprobante
  const [comprobante, setComprobante] = useState('');
  const [subiendoComprobante, setSubiendoComprobante] = useState(false);
  const [errorComprobante, setErrorComprobante] = useState(null);
  const [comprobanteSubido, setComprobanteSubido] = useState(false);

  useEffect(() => {
    const fetchPedido = async () => {
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

        const res = await axios.get(`/api/pedidos/${id}`, config);
        setPedido(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el pedido:', err);
        setError(err.response?.data?.msg || 'Error al cargar el pedido');
        setLoading(false);
      }
    };

    fetchPedido();
  }, [id]);

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Manejar cambio en campo de comprobante
  const handleComprobanteChange = (e) => {
    setComprobante(e.target.value);
    setErrorComprobante(null);
  };

  // Manejar subida de comprobante
  const handleSubirComprobante = async () => {
    if (!comprobante.trim()) {
      setErrorComprobante('Por favor ingresa la URL o número del comprobante');
      return;
    }

    try {
      setSubiendoComprobante(true);
      setErrorComprobante(null);
      
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.put(
        `/api/pedidos/${id}/comprobante`,
        { urlComprobante: comprobante },
        config
      );

      // Actualizar el estado del pedido
      setPedido(prev => ({
        ...prev,
        comprobantePago: comprobante,
        estadoPago: 'pendiente'
      }));
      
      setComprobanteSubido(true);
      setSubiendoComprobante(false);
    } catch (err) {
      console.error('Error al subir el comprobante:', err);
      setErrorComprobante(err.response?.data?.msg || 'Error al subir el comprobante');
      setSubiendoComprobante(false);
    }
  };

  // Manejar cancelación de pedido
  const handleCancelarPedido = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      return;
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.put(`/api/pedidos/${id}/cancelar`, {}, config);

      // Actualizar el estado del pedido
      setPedido(prev => ({
        ...prev,
        estadoPedido: 'cancelado'
      }));
      
      setLoading(false);
    } catch (err) {
      console.error('Error al cancelar el pedido:', err);
      setError(err.response?.data?.msg || 'Error al cancelar el pedido');
      setLoading(false);
    }
  };

  // Obtener el color y texto del estado de pedido
  const getEstadoPedidoInfo = (estado) => {
    const estados = {
      pendiente: { color: 'yellow', text: 'Pendiente' },
      procesando: { color: 'blue', text: 'Procesando' },
      enviado: { color: 'purple', text: 'Enviado' },
      entregado: { color: 'green', text: 'Entregado' },
      cancelado: { color: 'red', text: 'Cancelado' }
    };
    
    return estados[estado] || { color: 'gray', text: estado };
  };

  // Obtener el color y texto del estado de pago
  const getEstadoPagoInfo = (estado) => {
    const estados = {
      pendiente: { color: 'yellow', text: 'Pendiente de verificación' },
      pagado: { color: 'green', text: 'Pagado' },
      rechazado: { color: 'red', text: 'Rechazado' }
    };
    
    return estados[estado] || { color: 'gray', text: estado };
  };

  const generatePDF = async () => {
    try {
      const element = document.getElementById('order-detail');
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`pedido-${pedido.numeroPedido}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    }
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
        <Link to="/pedidos" className="text-primary-600 hover:underline mt-4 inline-block">
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Pedido no encontrado</h2>
        <Link to="/pedidos" className="text-primary-600 hover:underline">
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  const estadoPedidoInfo = getEstadoPedidoInfo(pedido.estadoPedido);
  const estadoPagoInfo = getEstadoPagoInfo(pedido.estadoPago);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Detalles del Pedido</h1>
        
        <div className="flex items-center gap-4">
          <button
            onClick={generatePDF}
            className="bg-[#FFD15C] hover:bg-[#FFC132] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar Comprobante
          </button>
          
          <Link to="/pedidos" className="text-primary-600 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Volver a mis pedidos
          </Link>
        </div>
      </div>
      
      <div id="order-detail" className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Pedido #{pedido.numeroPedido}</h2>
              <p className="text-gray-600 mt-1">Realizado el {formatFecha(pedido.createdAt)}</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className={`badge badge-${estadoPedidoInfo.color} text-base py-1 px-3`}>
                {estadoPedidoInfo.text}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Detalles de Envío</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium">{pedido.direccionEnvio.calle} {pedido.direccionEnvio.numero}</p>
                <p>{pedido.direccionEnvio.comuna}, {pedido.direccionEnvio.ciudad}</p>
                <p>{pedido.direccionEnvio.region}</p>
                {pedido.direccionEnvio.codigoPostal && <p>CP: {pedido.direccionEnvio.codigoPostal}</p>}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Método de Pago</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="capitalize font-medium">
                  {pedido.metodoPago === 'webpay' && 'WebPay (Tarjeta)'}
                  {pedido.metodoPago === 'transferencia' && 'Transferencia Bancaria'}
                  {pedido.metodoPago === 'efectivo' && 'Efectivo al recibir'}
                </p>
                <div className="mt-2">
                  <span className={`badge badge-${estadoPagoInfo.color}`}>
                    {estadoPagoInfo.text}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Productos del pedido */}
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            Productos
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left rounded-xl overflow-hidden shadow-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-3 px-4 text-gray-700 font-semibold">Producto</th>
                  <th className="py-3 px-4 text-gray-700 font-semibold">Precio</th>
                  <th className="py-3 px-4 text-gray-700 font-semibold">Cantidad</th>
                  <th className="py-3 px-4 text-gray-700 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pedido.productos.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      {item.producto && item.producto.nombre ? (
                        <span className="font-medium text-gray-800">{item.producto.nombre}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                          </svg>
                          Producto eliminado
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">{formatPrice(item.precioUnitario)}</td>
                    <td className="py-3 px-4">{item.cantidad}</td>
                    <td className="py-3 px-4 text-right font-semibold">{formatPrice(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="py-3 px-4 text-right font-medium">Subtotal</td>
                  <td className="py-3 px-4 text-right font-medium">{formatPrice(pedido.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="py-3 px-4 text-right font-medium">Envío</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {pedido.costoEnvio === 0 ? (
                      <span className="text-green-600 font-semibold">GRATIS</span>
                    ) : (
                      formatPrice(pedido.costoEnvio)
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan="3" className="py-3 px-4 text-right font-bold text-lg">Total</td>
                  <td className="py-3 px-4 text-right font-extrabold text-lg text-[#FFD15C]">{formatPrice(pedido.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Acciones del pedido */}
          <div className="border-t pt-6">
            {pedido.metodoPago === 'transferencia' && pedido.estadoPago === 'pendiente' && !pedido.comprobantePago && !comprobanteSubido && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Por favor realiza la transferencia y sube el comprobante para procesar tu pedido.
                    </p>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-yellow-800">Datos bancarios:</p>
                      <ul className="mt-2 text-sm text-yellow-700">
                        <li>Banco: Banco Estado</li>
                        <li>Tipo de cuenta: Cuenta Corriente</li>
                        <li>Número: 123456789</li>
                        <li>Nombre: PetShop SpA</li>
                        <li>RUT: 76.123.456-7</li>
                        <li>Email: pagos@petshop.cl</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Formulario de comprobante */}
            {pedido.metodoPago === 'transferencia' && pedido.estadoPago === 'pendiente' && !pedido.comprobantePago && !comprobanteSubido && (
              <div className="mb-6">
                <h4 className="font-medium mb-2">Subir comprobante de transferencia</h4>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={comprobante}
                    onChange={handleComprobanteChange}
                    placeholder="Ingresa número de comprobante o URL"
                    className="form-input flex-grow"
                  />
                  <button
                    onClick={handleSubirComprobante}
                    disabled={subiendoComprobante}
                    className="btn btn-primary whitespace-nowrap"
                  >
                    {subiendoComprobante ? 'Enviando...' : 'Subir comprobante'}
                  </button>
                </div>
                {errorComprobante && <p className="form-error mt-2">{errorComprobante}</p>}
              </div>
            )}
            
            {/* Mensaje de comprobante subido */}
            {comprobanteSubido && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Comprobante subido con éxito. Tu pago está en proceso de verificación.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Mostrar comprobante si existe */}
            {pedido.comprobantePago && (
              <div className="mb-6">
                <h4 className="font-medium mb-2">Comprobante de pago</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p>{pedido.comprobantePago}</p>
                </div>
              </div>
            )}
            
            {/* Botón de cancelar pedido */}
            {['pendiente', 'procesando'].includes(pedido.estadoPedido) && (
              <button
                onClick={handleCancelarPedido}
                className="btn btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              >
                Cancelar pedido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
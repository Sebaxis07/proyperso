// cliente/src/components/empleados/GestionPedido.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

// Usar import.meta.env en lugar de process.env
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

const GestionPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [estadoActual, setEstadoActual] = useState('');
  const [notasInternas, setNotasInternas] = useState('');
  const [actualizando, setActualizando] = useState(false);
  
  // Información de seguimiento
  const [seguimiento, setSeguimiento] = useState({
    numeroSeguimiento: '',
    empresa: 'Starken',
    urlSeguimiento: 'https://www.starken.cl/seguimiento',
    estimatedDelivery: '',
    nuevoEstado: ''
  });
  
  // Nuevo evento de seguimiento
  const [nuevoEvento, setNuevoEvento] = useState('');
  const [agregandoEvento, setAgregandoEvento] = useState(false);
  
  // Socket.io para actualizaciones en tiempo real
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Inicializar socket
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    // Unirse a la sala específica de este pedido
    newSocket.emit('joinOrderRoom', id);
    
    // Limpiar socket al desmontar
    return () => newSocket.disconnect();
  }, [id]);

  useEffect(() => {
    if (socket) {
      // Escuchar actualizaciones de seguimiento
      socket.on('seguimientoActualizado', data => {
        if (data.pedidoId === id) {
          setPedido(prevPedido => ({
            ...prevPedido,
            seguimiento: data.seguimiento,
            estadoPedido: data.estadoPedido
          }));
          
          toast.success('Información de seguimiento actualizada');
        }
      });
      
      // Escuchar nuevos eventos de seguimiento
      socket.on('eventoSeguimientoAgregado', data => {
        if (data.pedidoId === id) {
          setPedido(prevPedido => ({
            ...prevPedido,
            seguimiento: data.seguimiento
          }));
          
          toast.info('Nuevo evento de seguimiento registrado');
        }
      });
    }
  }, [socket, id]);

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
        setEstadoActual(res.data.data.estadoPedido);
        setNotasInternas(res.data.data.notasInternas || '');
        
        // Si el pedido es "enviado" y no tiene fecha estimada, establecer fecha por defecto
        if (res.data.data.estadoPedido === 'enviado') {
          const defaultDate = new Date();
          defaultDate.setDate(defaultDate.getDate() + 2); // Por defecto, 2 días después
          
          setSeguimiento(prev => ({
            ...prev,
            estimatedDelivery: defaultDate.toISOString().split('T')[0]
          }));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el pedido:', err);
        setError(err.response?.data?.msg || 'Error al cargar el pedido');
        setLoading(false);
      }
    };

    fetchPedido();
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return 'Fecha no disponible';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSeguimiento({
      ...seguimiento,
      [name]: value
    });
  };

  const handleEstadoChange = (e) => {
    setEstadoActual(e.target.value);
    
    // Si se cambia a "enviado", actualizar el estado en el seguimiento
    if (e.target.value === 'enviado') {
      setSeguimiento({
        ...seguimiento,
        nuevoEstado: 'enviado'
      });
    }
  };

  const actualizarEstadoPedido = async () => {
    try {
      setActualizando(true);
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      const res = await axios.put(
        `/api/pedidos/${id}/estado`,
        { 
          estadoPedido: estadoActual,
          notasInternas
        },
        config
      );
      
      setPedido(res.data.data);
      toast.success(`Pedido actualizado a: ${estadoActual}`);
      
      // Si el estado cambia a "enviado", mostrar opciones de seguimiento
      if (estadoActual === 'enviado' && !pedido.seguimiento) {
        toast.info('Ahora puedes añadir información de seguimiento');
      }
      
      setActualizando(false);
    } catch (err) {
      console.error('Error al actualizar el pedido:', err);
      toast.error(err.response?.data?.msg || 'Error al actualizar el pedido');
      setActualizando(false);
    }
  };

  const guardarSeguimiento = async () => {
    if (!seguimiento.numeroSeguimiento || !seguimiento.empresa) {
      toast.warning('Se requiere número de seguimiento y empresa de transporte');
      return;
    }
    
    try {
      setActualizando(true);
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      const dataToSend = {
        ...seguimiento,
        nuevoEstado: estadoActual // Asegurar que se usa el estado actual
      };
      
      const res = await axios.put(
        `/api/pedidos/${id}/seguimiento`,
        dataToSend,
        config
      );
      
      setPedido({
        ...pedido,
        seguimiento: res.data.data.seguimiento,
        estadoPedido: estadoActual
      });
      
      toast.success('Información de seguimiento actualizada');
      setActualizando(false);
    } catch (err) {
      console.error('Error al guardar seguimiento:', err);
      toast.error(err.response?.data?.msg || 'Error al guardar información de seguimiento');
      setActualizando(false);
    }
  };

  const agregarEventoHistoria = async () => {
    if (!nuevoEvento) {
      toast.warning('Ingresa una descripción del evento');
      return;
    }
    
    try {
      setAgregandoEvento(true);
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      const res = await axios.post(
        `/api/pedidos/${id}/seguimiento/evento`,
        { estado: nuevoEvento },
        config
      );
      
      setPedido({
        ...pedido,
        seguimiento: res.data.data.seguimiento
      });
      
      setNuevoEvento('');
      toast.success('Evento añadido al historial de seguimiento');
      setAgregandoEvento(false);
    } catch (err) {
      console.error('Error al agregar evento:', err);
      toast.error(err.response?.data?.msg || 'Error al agregar evento al historial');
      setAgregandoEvento(false);
    }
  };

  // Agregar nuevo estado para solicitudes
  const [solicitudCancelacion, setSolicitudCancelacion] = useState({
    pendiente: false,
    motivo: ''
  });

  const solicitarCancelacion = async () => {
  try {
    const motivo = window.prompt('Por favor, ingresa el motivo de la cancelación:');
    if (!motivo) return;

    setActualizando(true);
    
    const response = await axios.post(`/api/pedidos/${id}/solicitudes-cancelacion`, {
      motivo,
      estadoActual: pedido.estadoPedido,
      empleadoId: localStorage.getItem('userId') // Add employee ID
    });

    if (response.data.success) {
      toast.success('Solicitud de cancelación enviada al administrador');
      setSolicitudCancelacion({ 
        pendiente: true, 
        motivo,
        fechaSolicitud: new Date()
      });
    }
    
    setActualizando(false);
  } catch (err) {
    console.error('Error al solicitar cancelación:', err);
    toast.error(err.response?.data?.message || 'Error al enviar la solicitud de cancelación');
    setActualizando(false);
  }
};

// Add useEffect to check for existing cancellation request
useEffect(() => {
  const checkCancellationRequest = async () => {
    try {
      const response = await axios.get(`/api/pedidos/${id}/solicitudes-cancelacion`);
      if (response.data.data) {
        setSolicitudCancelacion({
          pendiente: true,
          motivo: response.data.data.motivo,
          fechaSolicitud: response.data.data.createdAt
        });
      }
    } catch (error) {
      console.error('Error checking cancellation request:', error);
    }
  };

  if (pedido && ['pendiente', 'procesando'].includes(pedido.estadoPedido)) {
    checkCancellationRequest();
  }
}, [id, pedido]);

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
          <button 
            onClick={() => navigate('/empleado/pedidos')}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Volver a pedidos
          </button>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="bg-gray-100 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Pedido no encontrado</h2>
          <button 
            onClick={() => navigate('/empleado/pedidos')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Volver a pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link 
              to="/empleado/pedidos" 
              className="text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Pedido #{pedido.numeroPedido}
            </h1>
          </div>
          <p className="text-gray-600 mt-1">
            Creado el {formatFecha(pedido.createdAt)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(pedido.estadoPedido)}`}>
            {pedido.estadoPedido.charAt(0).toUpperCase() + pedido.estadoPedido.slice(1)}
          </span>
          
          {pedido.estadoPago === 'pagado' ? (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
              Pagado
            </span>
          ) : pedido.estadoPago === 'pendiente' ? (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
              Pago pendiente
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
              Pago rechazado
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actualizar estado */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Gestionar pedido</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="estadoPedido" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado del pedido
                </label>
                <select
                  id="estadoPedido"
                  value={estadoActual}
                  onChange={handleEstadoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={pedido.estadoPedido === 'cancelado' || actualizando}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="procesando">Procesando</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="notasInternas" className="block text-sm font-medium text-gray-700 mb-1">
                  Notas internas
                </label>
                <textarea
                  id="notasInternas"
                  value={notasInternas}
                  onChange={(e) => setNotasInternas(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Añade notas internas sobre este pedido..."
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={actualizarEstadoPedido}
                  disabled={actualizando || estadoActual === pedido.estadoPedido && notasInternas === pedido.notasInternas}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {actualizando ? 'Actualizando...' : 'Actualizar pedido'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Información de seguimiento - Solo visible para estados "enviado" y "entregado" */}
          {['enviado', 'entregado'].includes(pedido.estadoPedido) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Información de seguimiento</h2>
              
              {pedido.seguimiento ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de seguimiento
                      </label>
                      <input
                        type="text"
                        name="numeroSeguimiento"
                        value={seguimiento.numeroSeguimiento || pedido.seguimiento.numeroSeguimiento}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ingresa el número de seguimiento"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Empresa de transporte
                      </label>
                      <input
                        type="text"
                        name="empresa"
                        value={seguimiento.empresa || pedido.seguimiento.empresa}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre de la empresa"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL de seguimiento
                      </label>
                      <input
                        type="text"
                        name="urlSeguimiento"
                        value={seguimiento.urlSeguimiento || pedido.seguimiento.urlSeguimiento}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="URL para seguimiento"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha estimada de entrega
                      </label>
                      <input
                        type="date"
                        name="estimatedDelivery"
                        value={seguimiento.estimatedDelivery || (pedido.seguimiento.estimatedDelivery ? new Date(pedido.seguimiento.estimatedDelivery).toISOString().split('T')[0] : '')}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={guardarSeguimiento}
                      disabled={actualizando}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {actualizando ? 'Guardando...' : 'Actualizar información de seguimiento'}
                    </button>
                  </div>
                  
                  {/* Historial de seguimiento */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Historial de seguimiento</h3>
                    
                    <div className="border-l-2 border-gray-200 pl-4 space-y-4 mt-4">
                      {pedido.seguimiento.historia?.map((evento, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-blue-500"></div>
                          <div>
                            <p className="text-gray-800">{evento.estado}</p>
                            <p className="text-sm text-gray-500">{formatFecha(evento.fecha)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Añadir nuevo evento */}
                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                      <h4 className="text-md font-medium text-gray-700 mb-2">Añadir nuevo evento</h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={nuevoEvento}
                          onChange={(e) => setNuevoEvento(e.target.value)}
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ej: Paquete en la oficina local"
                        />
                        <button
                          onClick={agregarEventoHistoria}
                          disabled={agregandoEvento || !nuevoEvento}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {agregandoEvento ? 'Agregando...' : 'Agregar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    No hay información de seguimiento disponible. Completa los siguientes datos:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de seguimiento
                      </label>
                      <input
                        type="text"
                        name="numeroSeguimiento"
                        value={seguimiento.numeroSeguimiento}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ingresa el número de seguimiento"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Empresa de transporte
                      </label>
                      <input
                        type="text"
                        name="empresa"
                        value={seguimiento.empresa}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre de la empresa"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL de seguimiento
                      </label>
                      <input
                        type="text"
                        name="urlSeguimiento"
                        value={seguimiento.urlSeguimiento}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="URL para seguimiento"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha estimada de entrega
                      </label>
                      <input
                        type="date"
                        name="estimatedDelivery"
                        value={seguimiento.estimatedDelivery}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={guardarSeguimiento}
                      disabled={actualizando || !seguimiento.numeroSeguimiento || !seguimiento.empresa}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {actualizando ? 'Guardando...' : 'Guardar información de seguimiento'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Productos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Productos del pedido</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Producto</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Precio</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Cantidad</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pedido.productos.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {item.producto?.imagenUrl && (
                            <img 
                              src={item.producto.imagenUrl} 
                              alt={item.producto.nombre} 
                              className="w-10 h-10 object-cover rounded-md mr-3"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.producto?.nombre || "Producto no disponible"}
                            </p>
                            {item.producto?.categorias && (
                              <p className="text-sm text-gray-500">
                                {item.producto.categorias.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {formatPrice(item.precioUnitario)}
                      </td>
                      <td className="py-3 px-4">
                        {item.cantidad}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatPrice(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="3" className="py-3 px-4 text-right font-medium">Subtotal:</td>
                    <td className="py-3 px-4 font-medium">{formatPrice(pedido.subtotal)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td colSpan="3" className="py-3 px-4 text-right font-medium">Envío:</td>
                    <td className="py-3 px-4 font-medium">
                      {pedido.costoEnvio === 0 
                        ? <span className="text-green-600">Gratis</span>
                        : formatPrice(pedido.costoEnvio)
                      }
                    </td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td colSpan="3" className="py-3 px-4 text-right font-bold">Total:</td>
                    <td className="py-3 px-4 font-bold text-lg">{formatPrice(pedido.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        
        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Información del cliente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Información del cliente</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium">{pedido.usuario?.nombre} {pedido.usuario?.apellido}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{pedido.usuario?.email}</p>
              </div>
              
              {pedido.usuario?.telefono && (
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{pedido.usuario.telefono}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Dirección de envío */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Dirección de envío</h2>
            
            <address className="not-italic space-y-1">
              <p className="font-medium">
                {pedido.direccionEnvio.calle} {pedido.direccionEnvio.numero}
                {pedido.direccionEnvio.departamento && `, ${pedido.direccionEnvio.departamento}`}
              </p>
              <p className="text-gray-600">{pedido.direccionEnvio.comuna}, {pedido.direccionEnvio.ciudad}</p>
              <p className="text-gray-600">{pedido.direccionEnvio.region}</p>
              {pedido.direccionEnvio.codigoPostal && (
                <p className="text-gray-600">CP: {pedido.direccionEnvio.codigoPostal}</p>
              )}
            </address>
          </div>
          
          {/* Método de pago */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Método de pago</h2>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                {pedido.metodoPago === 'webpay' && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                )}
                {pedido.metodoPago === 'transferencia' && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                )}
                {pedido.metodoPago === 'efectivo' && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              
              <div>
                <p className="capitalize font-medium text-gray-900">
                  {pedido.metodoPago === 'webpay' && 'WebPay (Tarjeta)'}
                  {pedido.metodoPago === 'transferencia' && 'Transferencia Bancaria'}
                  {pedido.metodoPago === 'efectivo' && 'Efectivo al recibir'}
                </p>
                <p className="text-sm text-gray-500">
                  {pedido.metodoPago === 'webpay' && 'Procesado con WebPay Plus'}
                  {pedido.metodoPago === 'transferencia' && 'Procesado mediante transferencia bancaria'}
                  {pedido.metodoPago === 'efectivo' && 'Se pagará al momento de la entrega'}
                </p>
              </div>
            </div>
            
            {pedido.metodoPago === 'transferencia' && pedido.comprobantePago && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-800">Comprobante de pago:</p>
                <p className="text-sm text-blue-700 break-words">{pedido.comprobantePago}</p>
              </div>
            )}
          </div>
          
          {/* Acciones rápidas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones rápidas</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => window.print()}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir pedido
              </button>
              
              {pedido.estadoPedido === 'pendiente' && (
                <button
                  onClick={() => {
                    setEstadoActual('procesando');
                    actualizarEstadoPedido();
                  }}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center gap-2"
                  disabled={actualizando}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Iniciar procesamiento
                </button>
              )}
              
              {pedido.estadoPedido === 'procesando' && (
                <button
                  onClick={() => {
                    setEstadoActual('enviado');
                    actualizarEstadoPedido();
                  }}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center justify-center gap-2"
                  disabled={actualizando}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Marcar como enviado
                </button>
              )}
              
              {pedido.estadoPedido === 'enviado' && (
                <button
                  onClick={() => {
                    setEstadoActual('entregado');
                    actualizarEstadoPedido();
                  }}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center gap-2"
                  disabled={actualizando}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Marcar como entregado
                </button>
              )}
              
              {['pendiente', 'procesando'].includes(pedido.estadoPedido) && (
                <>
                  {solicitudCancelacion.pendiente ? (
                    <div className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Solicitud de cancelación pendiente
                    </div>
                  ) : (
                    <button
                      onClick={solicitarCancelacion}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center gap-2"
                      disabled={actualizando}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Solicitar cancelación
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionPedido;
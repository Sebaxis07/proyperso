// cliente/src/components/pedidos/OrderTracker.jsx
import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';

const OrderTracker = ({ orderId, onUpdateStatus }) => {
  const { socket, isConnected, joinOrderRoom } = useSocket();
  const [seguimiento, setSeguimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewHistory, setViewHistory] = useState(false);
  
  useEffect(() => {
    // Unirse a la sala del pedido cuando el socket esté disponible
    if (isConnected) {
      joinOrderRoom(orderId);
    }
  }, [isConnected, orderId, joinOrderRoom]);
  
  useEffect(() => {
    // Escuchar actualizaciones de seguimiento
    if (socket) {
      socket.on('seguimientoActualizado', data => {
        if (data.pedidoId === orderId) {
          setSeguimiento(data.seguimiento);
          
          // Notificar al componente padre sobre el cambio de estado
          if (onUpdateStatus && data.estadoPedido) {
            onUpdateStatus(data.estadoPedido);
          }
        }
      });
      
      socket.on('eventoSeguimientoAgregado', data => {
        if (data.pedidoId === orderId) {
          setSeguimiento(data.seguimiento);
        }
      });
    }
    
    // Limpiar event listeners
    return () => {
      if (socket) {
        socket.off('seguimientoActualizado');
        socket.off('eventoSeguimientoAgregado');
      }
    };
  }, [socket, orderId, onUpdateStatus]);
  
  useEffect(() => {
    // Obtener información de seguimiento inicial
    const fetchSeguimiento = async () => {
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
        
        const res = await axios.get(`/api/pedidos/${orderId}/seguimiento`, config);
        setSeguimiento(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar seguimiento:', err);
        setError(err.response?.data?.msg || 'Error al cargar información de seguimiento');
        setLoading(false);
      }
    };
    
    fetchSeguimiento();
  }, [orderId]);
  
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatFechaCompleta = (fechaStr) => {
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p className="font-medium">Error al cargar información de seguimiento</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  if (!seguimiento) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-600">
          No hay información de seguimiento disponible para este pedido.
        </p>
      </div>
    );
  }
  
  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Número de seguimiento</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="font-semibold text-gray-700">{seguimiento.numeroSeguimiento}</p>
            <button 
              onClick={() => navigator.clipboard.writeText(seguimiento.numeroSeguimiento)}
              className="text-blue-600 hover:text-blue-800"
              title="Copiar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Empresa de transporte</p>
          <p className="font-semibold text-gray-700 mt-1">{seguimiento.empresa}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Fecha estimada de entrega</p>
          <p className="font-semibold text-gray-700 mt-1">
            {formatFechaCompleta(seguimiento.estimatedDelivery)}
          </p>
        </div>
        
        <div>
          {seguimiento.urlSeguimiento && (
            <a 
              href={seguimiento.urlSeguimiento} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium mt-3 md:mt-0"
            >
              Ver detalles de envío
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
      
      {seguimiento.historia && seguimiento.historia.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setViewHistory(!viewHistory)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className={`w-5 h-5 transition-transform ${viewHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {viewHistory ? 'Ocultar historial' : 'Ver historial de envío'}
          </button>
          
          {viewHistory && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
              {seguimiento.historia.map((evento, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-blue-500 absolute -left-5 top-1.5"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">{evento.estado}</p>
                    <p className="text-xs text-gray-500">{formatFecha(evento.fecha)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Indicador de conexión en tiempo real */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        <span className="text-xs text-gray-500">
          {isConnected ? 'Actualizaciones en tiempo real activas' : 'Conectando...'}
        </span>
      </div>
    </div>
  );
};

export default OrderTracker;
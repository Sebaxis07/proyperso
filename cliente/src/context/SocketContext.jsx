// src/context/SocketContext.jsx - Versión tolerante a fallos
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

// URL del socket (con fallback a null si no se puede conectar)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;


// Crear contexto
const SocketContext = createContext({
  socket: null,
  isConnected: false,
  joinOrderRoom: () => {},
  socketAvailable: false
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketAvailable, setSocketAvailable] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    let newSocket = null;
    
    try {
      // Configuración de Socket.IO con gestión de errores
      newSocket = io(SOCKET_URL, {
        reconnectionAttempts: 3, // Solo intenta reconectar 3 veces
        reconnectionDelay: 1000, // Espera 1 segundo entre intentos
        timeout: 5000, // Tiempo de espera para conexión
        autoConnect: true
      });
      
      // Manejar eventos de conexión
      newSocket.on('connect', () => {
        console.log('Socket.IO conectado');
        setIsConnected(true);
        setSocketAvailable(true);
        setReconnectAttempts(0);
      });
      
      newSocket.on('disconnect', () => {
        console.log('Socket.IO desconectado');
        setIsConnected(false);
      });
      
      // Manejar errores de conexión
      newSocket.on('connect_error', (err) => {
        console.error('Error de conexión Socket.IO:', err.message);
        setReconnectAttempts(prev => prev + 1);
        
        // Después de 3 intentos, desactivar Socket.IO completamente
        if (reconnectAttempts >= 2) {
          console.warn('Desactivando Socket.IO después de múltiples intentos fallidos');
          setSocketAvailable(false);
          newSocket.disconnect();
          // Mostrar mensaje discreto al usuario
          toast.info("Algunas actualizaciones en tiempo real no están disponibles", {
            position: "bottom-right",
            autoClose: 5000
          });
        }
      });
      
      setSocket(newSocket);
    } catch (error) {
      console.error('Error al inicializar Socket.IO:', error);
      setSocketAvailable(false);
    }
    
    // Limpiar al desmontar
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [reconnectAttempts]);

  // Función para unirse a la sala de un pedido específico
  const joinOrderRoom = (orderId) => {
    if (socket && isConnected && socketAvailable) {
      socket.emit('joinOrderRoom', orderId);
    }
  };

  const value = {
    socket,
    isConnected,
    joinOrderRoom,
    socketAvailable
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
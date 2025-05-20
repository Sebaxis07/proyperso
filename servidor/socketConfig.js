import { Server } from 'socket.io';

let io;

// Función para inicializar Socket.IO con el servidor HTTP
export const initializeSocketIO = (server) => {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "*", // Permitir todas las conexiones (puedes restringirlo después)
        methods: ["GET", "POST"],
        credentials: true
      },
      connectionStateRecovery: {
        // Habilitar recuperación de estado de conexión
        maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutos
      },
      // Configuración para intentos de reconexión menos agresivos
      pingTimeout: 30000,
      pingInterval: 25000
    });

    io.on('connection', (socket) => {
      console.log('Cliente conectado a Socket.IO:', socket.id);

      // Unir al cliente a una sala específica para seguimiento de pedidos
      socket.on('joinOrderRoom', (orderId) => {
        socket.join(`order-${orderId}`);
        console.log(`Cliente ${socket.id} unido a la sala order-${orderId}`);
      });

      socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
      });
    });
  }
  
  return io;
};

// Obtener la instancia de Socket.IO
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO no ha sido inicializado');
  }
  return io;
};

// Función para emitir actualizaciones a una sala específica
export const emitToRoom = (room, event, data) => {
  if (!io) return;
  io.to(room).emit(event, data);
};
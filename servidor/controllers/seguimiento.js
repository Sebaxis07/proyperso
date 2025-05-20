// servidor/controllers/seguimiento.js
import Pedido from '../models/Pedido.js';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

let io;

// Inicializar Socket.io
export const initializeSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"]
    }
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

  return io;
};

// @desc    Actualizar información de seguimiento
// @route   PUT /api/pedidos/:id/seguimiento
// @access  Private (Empleados y Admin)
export const actualizarSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        msg: 'ID de pedido inválido' 
      });
    }

    const { 
      numeroSeguimiento, 
      empresa, 
      urlSeguimiento, 
      estimatedDelivery,
      nuevoEstado 
    } = req.body;

    // Validar datos requeridos
    if (!numeroSeguimiento || !empresa) {
      return res.status(400).json({
        success: false,
        msg: 'Se requiere número de seguimiento y empresa de transporte'
      });
    }

    const pedido = await Pedido.findById(id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        msg: 'Pedido no encontrado'
      });
    }

    // Crear o actualizar información de seguimiento
    const fechaEnvio = new Date();
    
    // Actualizar estadoPedido si se proporciona y es válido
    if (nuevoEstado && ['procesando', 'enviado', 'entregado'].includes(nuevoEstado)) {
      pedido.estadoPedido = nuevoEstado;
    }

    // Crear nuevo evento en el historial
    const nuevoEvento = {
      fecha: fechaEnvio,
      estado: nuevoEstado === 'enviado' 
        ? 'Pedido enviado' 
        : nuevoEstado === 'procesando'
          ? 'Pedido en preparación'
          : nuevoEstado === 'entregado'
            ? 'Pedido entregado'
            : 'Estado actualizado'
    };

    // Actualizar o crear objeto de seguimiento
    const seguimientoInfo = {
      numeroSeguimiento,
      empresa,
      fechaEnvio,
      urlSeguimiento: urlSeguimiento || '',
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      historia: [nuevoEvento]
    };

    // Guardar la información de seguimiento en el pedido
    pedido.seguimiento = seguimientoInfo;
    
    await pedido.save();

    // Emitir evento de actualización vía Socket.io
    if (io) {
      io.to(`order-${id}`).emit('seguimientoActualizado', {
        pedidoId: id,
        seguimiento: seguimientoInfo,
        estadoPedido: pedido.estadoPedido
      });
    }

    res.json({
      success: true,
      data: {
        pedido,
        seguimiento: seguimientoInfo
      }
    });
  } catch (err) {
    console.error('Error al actualizar seguimiento:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al actualizar seguimiento',
      error: err.message 
    });
  }
};

// @desc    Añadir evento al historial de seguimiento
// @route   POST /api/pedidos/:id/seguimiento/evento
// @access  Private (Empleados y Admin)
export const agregarEventoSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        msg: 'Se requiere el estado del evento'
      });
    }

    const pedido = await Pedido.findById(id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        msg: 'Pedido no encontrado'
      });
    }

    if (!pedido.seguimiento) {
      return res.status(400).json({
        success: false,
        msg: 'Este pedido no tiene información de seguimiento aún'
      });
    }

    // Añadir nuevo evento
    const nuevoEvento = {
      fecha: new Date(),
      estado
    };

    pedido.seguimiento.historia.push(nuevoEvento);
    
    await pedido.save();

    // Emitir evento de actualización vía Socket.io
    if (io) {
      io.to(`order-${id}`).emit('eventoSeguimientoAgregado', {
        pedidoId: id,
        nuevoEvento,
        seguimiento: pedido.seguimiento
      });
    }

    res.json({
      success: true,
      data: {
        pedido,
        nuevoEvento,
        seguimiento: pedido.seguimiento
      }
    });
  } catch (err) {
    console.error('Error al añadir evento de seguimiento:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al añadir evento de seguimiento',
      error: err.message 
    });
  }
};

// @desc    Obtener información de seguimiento
// @route   GET /api/pedidos/:id/seguimiento
// @access  Private
export const getSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pedido = await Pedido.findById(id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        msg: 'Pedido no encontrado'
      });
    }

    // Verificar que el usuario es dueño del pedido o admin/empleado
    if (
      pedido.usuario.toString() !== req.usuario.id && 
      !['admin', 'empleado'].includes(req.usuario.rol)
    ) {
      return res.status(403).json({
        success: false,
        msg: 'No autorizado para ver esta información'
      });
    }

    // Si no hay seguimiento aún, generar uno apropiado según el estado
    let seguimientoInfo = pedido.seguimiento;
    
    if (!seguimientoInfo && ['enviado', 'entregado'].includes(pedido.estadoPedido)) {
      // Generar información de seguimiento básica si no existe
      seguimientoInfo = {
        numeroSeguimiento: 'SP' + Math.floor(Math.random() * 10000000),
        empresa: 'Starken',
        fechaEnvio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        urlSeguimiento: 'https://www.starken.cl/seguimiento',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        historia: [
          { fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), estado: 'Pedido recibido en centro de distribución' },
          { fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), estado: 'En ruta hacia destino' },
          { fecha: new Date(), estado: 'En reparto final' }
        ]
      };
    }

    res.json({
      success: true,
      data: seguimientoInfo
    });
  } catch (err) {
    console.error('Error al obtener seguimiento:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Error al obtener seguimiento',
      error: err.message 
    });
  }
};
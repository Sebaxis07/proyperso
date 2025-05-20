import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import SolicitudCancelacion from '../models/SolicitudCancelacion.js';

const router = express.Router();

// Obtener todas las solicitudes de cancelación (solo para admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const solicitudes = await SolicitudCancelacion.find()
      .populate('pedido')
      .populate('empleado', 'nombre apellido email');

    res.json({
      success: true,
      data: solicitudes
    });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las solicitudes de cancelación',
      error: error.message
    });
  }
});

// Crear nueva solicitud de cancelación (solo para empleado y admin)
router.post('/', protect, authorize('empleado', 'admin'), async (req, res) => {
  try {
    const { pedidoId, motivo } = req.body;

    const solicitud = new SolicitudCancelacion({
      pedido: pedidoId,
      empleado: req.usuario.id,
      motivo,
      estado: 'pendiente'
    });

    await solicitud.save();

    res.status(201).json({
      success: true,
      data: solicitud,
      message: 'Solicitud de cancelación creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la solicitud de cancelación',
      error: error.message
    });
  }
});

export default router;
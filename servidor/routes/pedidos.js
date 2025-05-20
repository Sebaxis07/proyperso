import { Router } from 'express';
import {
  crearPedido,
  getPedidos,
  getPedido,
  subirComprobante,
  cancelarPedido,
  actualizarEstadoPedido,
  getPedidosAdmin,
  getPedidosStats,
  getPedidosRecientes,
  getPedidosCount,
  asignarPedido,
  getPedidosPendientes
} from '../controllers/pedidos.js';
import {
  actualizarSeguimiento,
  agregarEventoSeguimiento,
  getSeguimiento
} from '../controllers/seguimiento.js';
import { protect, authorize } from '../middleware/auth.js';
import { check } from 'express-validator';
import SolicitudCancelacion from '../models/SolicitudCancelacion.js'; // Importa el modelo
const router = Router();

// ✅ Validaciones para crear pedido
const validarPedido = [
  check('productos').isArray().notEmpty().withMessage('Debe incluir productos'),
  check('productos.*.producto').isMongoId().withMessage('ID de producto inválido'),
  check('productos.*.cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser al menos 1'),
  check('direccionEnvio').notEmpty().withMessage('La dirección de envío es requerida'),
  check('metodoPago').isIn(['webpay', 'transferencia', 'efectivo']).withMessage('Método de pago inválido')
];

// ✅ Rutas públicas o para clientes autenticados
router.route('/')
  .post(protect, validarPedido, crearPedido)
  .get(protect, getPedidos);

// ✅ Ruta para contar pedidos (solo para admin/empleado)
router.route('/count')
  .get(protect, authorize('admin', 'empleado'), getPedidosCount);

// ✅ Ruta para pedidos recientes
router.route('/recientes')
  .get(protect, authorize('admin', 'empleado'), getPedidosRecientes);

// ✅ Ruta para pedidos pendientes
router.route('/pendientes')
  .get(protect, authorize('admin', 'empleado'), getPedidosPendientes);

// ✅ Ruta para estadísticas
router.route('/stats')
  .get(protect, authorize('admin', 'empleado'), getPedidosStats);

// ✅ Ruta para obtener todos los pedidos (admin/empleado)
router.route('/admin/todos')
  .get(protect, authorize('admin', 'empleado'), getPedidosAdmin);

// ✅ Rutas específicas (antes de `/:id`)
router.route('/:id/comprobante')
  .put(protect, [
    check('urlComprobante', 'Debe proporcionar la URL del comprobante').notEmpty()
  ], subirComprobante);

router.route('/:id/cancelar')
  .put(protect, cancelarPedido);

router.route('/:id/estado')
  .put(
    protect,
    authorize('admin', 'empleado'),
    [
      check('estadoPedido').optional().isIn(['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado']),
      check('estadoPago').optional().isIn(['pendiente', 'pagado', 'rechazado']),
    ],
    (req, res, next) => {
      const { estadoPedido, estadoPago } = req.body;
      if (!estadoPedido && !estadoPago) {
        return res.status(400).json({ error: 'Debe proporcionar al menos estadoPedido o estadoPago' });
      }
      next();
    },
    actualizarEstadoPedido
  );

router.route('/:id/asignar')
  .put(protect, authorize('admin', 'empleado'), asignarPedido);

// ✅ Rutas para seguimiento
router.route('/:id/seguimiento')
  .get(protect, getSeguimiento)
  .put(protect, authorize('admin', 'empleado'), actualizarSeguimiento);

router.route('/:id/seguimiento/evento')
  .post(protect, authorize('admin', 'empleado'), agregarEventoSeguimiento);

// ✅ Rutas para solicitudes de cancelación
router.route('/:id/solicitudes-cancelacion')
  .get(protect, async (req, res) => {
    try {
      const solicitud = await SolicitudCancelacion.findOne({ 
        pedido: req.params.id,
        estado: 'pendiente'
      });
      
      res.json({
        success: true,
        data: solicitud
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la solicitud de cancelación',
        error: error.message
      });
    }
  })
  .post(protect, async (req, res) => {
    try {
      const { motivo, estadoActual, empleadoId } = req.body;
      
      const solicitud = new SolicitudCancelacion({
        pedido: req.params.id,
        empleado: empleadoId,
        motivo,
        estadoActual,
        estado: 'pendiente',
        createdAt: new Date()
      });
      
      await solicitud.save();
      
      // Notify admin about new cancellation request
      // Implementation depends on your notification system
      
      res.status(201).json({
        success: true,
        message: 'Solicitud de cancelación creada correctamente',
        data: solicitud
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la solicitud de cancelación',
        error: error.message
      });
    }
  });

// ✅ Ruta genérica para obtener un pedido específico (ubicada al final del grupo)
router.route('/:id')
  .get(protect, getPedido);

export default router;

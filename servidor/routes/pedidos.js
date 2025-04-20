import { Router } from 'express';
import { 
    crearPedido, 
    getPedidos, 
    getPedido, 
    subirComprobante, 
    cancelarPedido,
    actualizarEstadoPedido,
    getPedidosAdmin
} from '../controllers/pedidos.js';
import { protect, authorize } from '../middleware/auth.js';
import { check } from 'express-validator';

const router = Router();

// Validaciones para crear pedido
const validarPedido = [
    check('productos').isArray().notEmpty().withMessage('Debe incluir productos'),
    check('productos.*.producto').isMongoId().withMessage('ID de producto inválido'),
    check('productos.*.cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser al menos 1'),
    check('direccionEnvio').notEmpty().withMessage('La dirección de envío es requerida'),
    check('metodoPago').isIn(['webpay', 'transferencia', 'efectivo']).withMessage('Método de pago inválido')
];

// Ruta para crear pedido con validaciones
router.post('/', protect, validarPedido, crearPedido);

// Rutas para obtener pedidos
router.get('/', protect, getPedidos);
router.get('/admin/todos', protect, authorize('admin'), getPedidosAdmin);
router.get('/:id', protect, getPedido);

// Rutas para actualizar pedidos
router.put('/:id/comprobante', protect, [
    check('urlComprobante', 'Debe proporcionar la URL del comprobante').notEmpty()
], subirComprobante);

router.put('/:id/cancelar', protect, cancelarPedido);

router.put('/:id/estado', protect, authorize('admin'), [
    check('estadoPedido').optional().isIn(['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado']),
    check('estadoPago').optional().isIn(['pendiente', 'pagado', 'rechazado'])
], actualizarEstadoPedido);

export default router;
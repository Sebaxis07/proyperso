// servidor/routes/pedidos.js
import { Router } from 'express';
import { 
    crearPedido, 
    getPedidos, 
    getPedido, 
    subirComprobante, 
    cancelarPedido,
    actualizarEstadoPedido 
} from '../controllers/pedidos.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, crearPedido);
router.get('/', protect, getPedidos);
router.get('/:id', protect, getPedido);
router.put('/:id/comprobante', protect, subirComprobante);
router.put('/:id/cancelar', protect, cancelarPedido);
router.put('/:id/estado', protect, authorize('admin'), actualizarEstadoPedido);

export default router;
import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { getProductos, getProducto, crearProducto, actualizarProducto, eliminarProducto } from '../controllers/productos.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Rutas públicas
router.get('/', getProductos);
router.get('/:id', getProducto);

// Rutas protegidas (solo admin)
router.post('/', protect, authorize('admin'), upload.single('imagen'), crearProducto);
router.put('/:id', protect, authorize('admin'), upload.single('imagen'), actualizarProducto);
router.delete('/:id', protect, authorize('admin'), eliminarProducto);

export default router;
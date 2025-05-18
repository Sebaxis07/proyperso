import express from 'express';
import { 
  getTestimonios, 
  createTestimonio, 
  getTestimoniosAdmin, 
  aprobarTestimonio, 
  deleteTestimonio 
} from '../controllers/testimonioController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get('/', getTestimonios);

// Ruta para crear testimonios - NO requiere autenticación
router.post('/', createTestimonio);

// Rutas protegidas (requieren autenticación)
router.delete('/:id', protect, deleteTestimonio);

// Rutas de administrador
router.get('/admin', protect, admin, getTestimoniosAdmin);
router.put('/:id/aprobar', protect, admin, aprobarTestimonio);

export default router;
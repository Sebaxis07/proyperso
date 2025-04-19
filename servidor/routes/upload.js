import { Router } from 'express';
import { uploadImage } from '../controllers/upload.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Ruta para subir imágenes (solo admin)
router.post('/', protect, authorize('admin'), uploadImage);

export default router;
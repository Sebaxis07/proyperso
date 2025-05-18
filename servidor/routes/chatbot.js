import express from 'express';
import { sendMessage, getConversationHistory } from '../controllers/chatbotController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Ruta para enviar mensajes - no requiere autenticación
router.post('/message', sendMessage);

// Ruta para obtener historial - NO requiere autenticación para simplificar
router.get('/history/:sessionId', getConversationHistory);

export default router;
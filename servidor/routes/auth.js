// servidor/routes/auth.js
import { Router } from 'express';
import { check } from 'express-validator';
import { register, login, getMe, updateProfile } from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Validaciones para registro
const validacionesRegistro = [
  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
  check('apellido', 'El apellido es obligatorio').not().isEmpty(),
  check('email', 'Por favor incluya un email válido').isEmail(),
  check('rut', 'El RUT es obligatorio').not().isEmpty(),
  check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 })
];

// Validaciones para login
const validacionesLogin = [
  check('email', 'Por favor incluya un email válido').isEmail(),
  check('password', 'La contraseña es obligatoria').exists()
];

// Rutas
router.post('/register', validacionesRegistro, register);
router.post('/login', validacionesLogin, login);
router.get('/me', protect, getMe);
router.put('/perfil', protect, updateProfile);

export default router;
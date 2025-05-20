// Actualización del router de usuarios - usuarios.js

import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import Usuario from '../models/Usuario.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configurar multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadPath = 'uploads/profiles';
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    cb(null, `user-${req.usuario.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Filtro de archivos para asegurar que sean imágenes
const fileFilter = (req, file, cb) => {
  // Permitir solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// @desc    Obtener todos los usuarios (solo admin)
// @route   GET /api/usuarios
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');

    res.json({
      success: true,
      count: usuarios.length,
      data: usuarios
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
});

// @desc    Obtener un usuario por ID (solo admin o el propio usuario)
// @route   GET /api/usuarios/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Verificar que sea admin o el propio usuario
    if (req.usuario.rol !== 'admin' && req.usuario.id !== req.params.id) {
      return res.status(403).json({ msg: 'No autorizado para ver este perfil' });
    }

    const usuario = await Usuario.findById(req.params.id).select('-password');

    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      data: usuario
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error en el servidor' });
  }
});

// @desc    Crear un nuevo usuario (solo admin)
// @route   POST /api/usuarios
// @access  Private/Admin
router.post('/', protect, authorize('admin'), [
  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
  check('apellido', 'El apellido es obligatorio').not().isEmpty(),
  check('email', 'Por favor incluya un email válido').isEmail(),
  check('rut', 'El RUT es obligatorio').not().isEmpty(),
  check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  check('rol', 'El rol es obligatorio').isIn(['cliente', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, apellido, email, rut, password, telefono, direccion, rol, fotoPerfil } = req.body;

    // Verificar si el usuario ya existe
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // Verificar si el RUT ya existe
    usuario = await Usuario.findOne({ rut });
    if (usuario) {
      return res.status(400).json({ msg: 'El RUT ya está registrado' });
    }

    // Crear nuevo usuario
    usuario = new Usuario({
      nombre,
      apellido,
      email,
      rut,
      password,
      telefono,
      direccion,
      rol,
      fotoPerfil: fotoPerfil || 'default-avatar.png',
      tipoFoto: 'predeterminada'
    });

    await usuario.save();

    res.status(201).json({
      success: true,
      data: usuario
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
});

// @desc    Actualizar un usuario (solo admin o el propio usuario)
// @route   PUT /api/usuarios/:id
// @access  Private
router.put('/:id', [
  protect,
  [
    check('nombre', 'El nombre es obligatorio').optional().not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').optional().not().isEmpty(),
    check('email', 'Por favor incluya un email válido').optional().isEmail()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Verificar que sea admin o el propio usuario
    if (req.usuario.rol !== 'admin' && req.usuario.id !== req.params.id) {
      return res.status(403).json({ msg: 'No autorizado para actualizar este perfil' });
    }

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Datos actualizables
    const { nombre, apellido, email, telefono, direccion, fotoPerfil, tipoFoto } = req.body;

    // Construir objeto de actualización
    const camposActualizacion = {};
    if (nombre) camposActualizacion.nombre = nombre;
    if (apellido) camposActualizacion.apellido = apellido;
    if (email) {
      // Verificar si el email ya está en uso por otro usuario
      const existeUsuario = await Usuario.findOne({ email });
      if (existeUsuario && existeUsuario._id.toString() !== req.params.id) {
        return res.status(400).json({ msg: 'El email ya está en uso' });
      }
      camposActualizacion.email = email;
    }
    if (telefono) camposActualizacion.telefono = telefono;
    if (direccion) camposActualizacion.direccion = direccion;
    if (fotoPerfil) {
      camposActualizacion.fotoPerfil = fotoPerfil;
      if (tipoFoto) camposActualizacion.tipoFoto = tipoFoto;
    }

    // Actualizar usuario
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      { $set: camposActualizacion },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: usuarioActualizado
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error en el servidor' });
  }
});

// @desc    Eliminar un usuario (solo admin)
// @route   DELETE /api/usuarios/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // No permitir eliminar el propio usuario admin
    if (req.usuario.rol === 'admin' && req.usuario.id === req.params.id) {
      return res.status(400).json({ msg: 'No puede eliminar su propia cuenta de administrador' });
    }

    // Si el usuario tiene una foto de perfil personalizada, eliminarla
    if (usuario.tipoFoto === 'personalizada' && usuario.fotoPerfil !== 'default-avatar.png') {
      const imagePath = path.join('uploads/profiles', usuario.fotoPerfil);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await usuario.deleteOne();

    res.json({
      success: true,
      msg: 'Usuario eliminado'
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error en el servidor' });
  }
});

// @desc    Cambiar rol de usuario (solo admin)
// @route   PUT /api/usuarios/:id/rol
// @access  Private/Admin
router.put('/:id/rol', protect, authorize('admin'), async (req, res) => {
  try {
    const { rol } = req.body;

    // Validar rol
    if (!rol || !['cliente', 'admin'].includes(rol)) {
      return res.status(400).json({ msg: 'Rol inválido' });
    }

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // No permitir cambiar el rol del propio usuario admin
    if (req.usuario.id === req.params.id) {
      return res.status(400).json({ msg: 'No puede cambiar su propio rol' });
    }

    usuario.rol = rol;
    await usuario.save();

    res.json({
      success: true,
      data: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error en el servidor' });
  }
});

// @desc    Seleccionar foto predeterminada
// @route   PUT /api/usuarios/:id/foto-predeterminada
// @access  Private
router.put('/:id/foto-predeterminada', protect, async (req, res) => {
  try {
    // Verificar que sea el propio usuario o un admin
    if (req.usuario.rol !== 'admin' && req.usuario.id !== req.params.id) {
      return res.status(403).json({ msg: 'No autorizado para actualizar este perfil' });
    }

    const { fotoPerfil } = req.body;

    if (!fotoPerfil) {
      return res.status(400).json({ msg: 'Debe seleccionar una foto predeterminada' });
    }

    // Validar que la foto predeterminada existe (aquí agregarías tu lógica para verificar)
    const fotosPredeterminadas = ['avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png', 'avatar5.png', 'default-avatar.png'];
    if (!fotosPredeterminadas.includes(fotoPerfil)) {
      return res.status(400).json({ msg: 'Foto predeterminada inválida' });
    }

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Actualizar a la foto predeterminada
    usuario.fotoPerfil = fotoPerfil;
    usuario.tipoFoto = 'predeterminada';
    await usuario.save();

    res.json({
      success: true,
      data: {
        fotoPerfil: usuario.fotoPerfil,
        tipoFoto: usuario.tipoFoto
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error al seleccionar la foto predeterminada' });
  }
});

// @desc    Subir foto de perfil
// @route   POST /api/usuarios/:id/foto
// @access  Private
router.post('/:id/foto', protect, upload.single('fotoPerfil'), async (req, res) => {
  try {
    // Verificar que sea el propio usuario o un admin
    if (req.usuario.rol !== 'admin' && req.usuario.id !== req.params.id) {
      return res.status(403).json({ msg: 'No autorizado para actualizar este perfil' });
    }

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Si el usuario tenía una foto personalizada, eliminarla
    if (usuario.tipoFoto === 'personalizada') {
      const oldImagePath = path.join('uploads/profiles', usuario.fotoPerfil);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Actualizar la foto de perfil del usuario
    usuario.fotoPerfil = req.file.filename;
    usuario.tipoFoto = 'personalizada';
    await usuario.save();

    res.json({
      success: true,
      data: {
        fotoPerfil: usuario.fotoPerfil,
        tipoFoto: usuario.tipoFoto
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error al subir la foto de perfil' });
  }
});

export default router;
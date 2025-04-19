// servidor/controllers/auth.js
import Usuario from '../models/Usuario.js';
import { validationResult } from 'express-validator';

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
export async function register(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, apellido, email, rut, password, telefono, direccion } = req.body;

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
      direccion
    });

    await usuario.save();

    // Generar JWT
    const token = usuario.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}

// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
export async function login(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Verificar si el usuario existe
    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario) {
      return res.status(401).json({ msg: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await usuario.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = usuario.getSignedJwtToken();

    res.json({
      success: true,
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rut: usuario.rut,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
export async function getMe(req, res) {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    res.json(usuario);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}

// @desc    Actualizar perfil de usuario
// @route   PUT /api/auth/perfil
// @access  Private
export async function updateProfile(req, res) {
  try {
    const { nombre, apellido, telefono, direccion } = req.body;

    // Construir objeto de actualización
    const camposActualizacion = {};
    if (nombre) camposActualizacion.nombre = nombre;
    if (apellido) camposActualizacion.apellido = apellido;
    if (telefono) camposActualizacion.telefono = telefono;
    if (direccion) camposActualizacion.direccion = direccion;

    // Actualizar usuario
    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario.id,
      camposActualizacion,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      usuario
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}
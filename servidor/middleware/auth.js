import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

// Middleware para proteger rutas (requiere autenticación)
export const protect = async (req, res, next) => {
  try {
    // Obtener el token del header de autorización
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Se requiere autenticación.'
      });
    }
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario y adjuntarlo a la request (excluir contraseña)
    const usuario = await Usuario.findById(decoded.id).select('-password');
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

// Middleware para verificar si el usuario es administrador
export const admin = (req, res, next) => {
  if (req.usuario && req.usuario.esAdmin) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos de administrador'
    });
  }
};

// Middleware para autorización por roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: `El rol ${req.usuario.rol} no está autorizado para acceder a esta ruta`
      });
    }
    next();
  };
};
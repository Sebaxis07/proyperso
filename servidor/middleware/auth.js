import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

// Middleware para proteger rutas
export async function protect(req, res, next) {
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
    
    // Buscar el usuario y adjuntarlo a la request
    const usuario = await Usuario.findById(decoded.id);
    
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
}

// Middleware para autorización por roles
export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        success: false,
        message: `El rol ${req.usuario.rol} no está autorizado para acceder a esta ruta` 
      });
    }
    next();
  };
}
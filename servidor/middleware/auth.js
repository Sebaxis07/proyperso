// servidor/middleware/auth.js
import jwt from 'jsonwebtoken';  // Change to default import
import Usuario from '../models/Usuario.js';  // Import the model

// Middleware para proteger rutas
export async function protect(req, res, next) {
  let token;

  // Verificar si existe token en el header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Verificar si no hay token
  if (!token) {
    return res.status(401).json({ msg: 'No autorizado para acceder a esta ruta' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario usando el modelo
    req.usuario = await Usuario.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'No autorizado para acceder a esta ruta' });
  }
}

// Middleware para roles específicos
export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ msg: `El rol ${req.usuario.rol} no está autorizado para acceder a esta ruta` });
    }
    next();
  };
}
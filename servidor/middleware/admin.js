// Middleware para verificar si el usuario es administrador
export const isAdmin = (req, res, next) => {
  // Verificar si existe usuario y es admin
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({ 
      success: false,
      msg: 'Acceso denegado - Solo administradores' 
    });
  }
  next();
};

export default isAdmin;
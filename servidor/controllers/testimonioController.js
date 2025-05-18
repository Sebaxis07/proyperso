import Testimonio from '../models/testimonio.js';
import Usuario from '../models/Usuario.js';
import mongoose from 'mongoose';

// Obtener todos los testimonios aprobados
export const getTestimonios = async (req, res) => {
  try {
    const testimonios = await Testimonio.find({ aprobado: true })
      .sort({ fecha: -1 });
    
    res.json(testimonios);
  } catch (error) {
    console.error('Error al obtener testimonios:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener testimonios',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

// Crear un nuevo testimonio
export const createTestimonio = async (req, res) => {
  try {
    const { texto, calificacion, usuarioId, nombre } = req.body;
    
    // Validar datos básicos
    if (!texto || texto.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'El testimonio debe tener al menos 10 caracteres' 
      });
    }
    
    if (!calificacion || calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'La calificación debe estar entre 1 y 5' 
      });
    }

    // Preparar los datos del testimonio
    let testimonioData = {
      texto,
      calificacion,
      fecha: new Date(),
      aprobado: true, // Aprobación automática
      cargo: 'Cliente'
    };
    
    // Si hay usuario autenticado, usar sus datos
    if (req.usuario) {
      testimonioData.usuario = req.usuario._id;
      testimonioData.nombre = req.usuario.nombre;
      testimonioData.imagen = req.usuario.imagen || null;
      testimonioData.anonimo = false;
    } 
    // Si no hay req.usuario pero recibimos usuarioId y nombre en el body
    else if (usuarioId && nombre) {
      // Verificar si el ID es válido
      if (mongoose.Types.ObjectId.isValid(usuarioId)) {
        // Intentar verificar que el usuario existe
        try {
          const usuario = await Usuario.findById(usuarioId);
          if (usuario) {
            testimonioData.usuario = usuarioId;
            testimonioData.nombre = nombre;
            testimonioData.imagen = usuario.imagen || null;
            testimonioData.anonimo = false;
          } else {
            // El ID es válido pero no existe en la base de datos
            testimonioData.nombre = nombre || 'Usuario';
            testimonioData.anonimo = true;
          }
        } catch (err) {
          console.log('No se pudo verificar el usuario:', err);
          testimonioData.nombre = nombre || 'Usuario';
          testimonioData.anonimo = true;
        }
      } else {
        // El ID no es un ObjectId válido
        testimonioData.nombre = nombre || 'Usuario';
        testimonioData.anonimo = true;
      }
    } else {
      // Si no hay información de usuario, marcar como anónimo
      testimonioData.nombre = nombre || 'Usuario anónimo';
      testimonioData.anonimo = true;
    }
    
    // Crear nuevo testimonio
    const nuevoTestimonio = new Testimonio(testimonioData);
    await nuevoTestimonio.save();
    
    res.status(201).json({
      success: true,
      message: '¡Gracias por tu testimonio! Ha sido publicado exitosamente.',
      testimonio: nuevoTestimonio
    });
    
  } catch (error) {
    console.error('Error al crear testimonio:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear testimonio',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

// Obtener testimonios para administración (solo admin)
export const getTestimoniosAdmin = async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (!req.usuario.esAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
    }
    
    const testimonios = await Testimonio.find()
      .sort({ fecha: -1 })
      .populate('usuario', 'nombre email');
    
    res.json(testimonios);
  } catch (error) {
    console.error('Error al obtener testimonios para admin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener testimonios',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

// Actualizar estado de aprobación (solo admin)
export const aprobarTestimonio = async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobado } = req.body;
    
    // Verificar si el usuario es administrador
    if (!req.usuario.esAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
    }
    
    const testimonio = await Testimonio.findById(id);
    
    if (!testimonio) {
      return res.status(404).json({ 
        success: false, 
        message: 'Testimonio no encontrado' 
      });
    }
    
    testimonio.aprobado = aprobado;
    await testimonio.save();
    
    res.json({
      success: true,
      message: `El testimonio ha sido ${aprobado ? 'aprobado' : 'rechazado'} exitosamente.`,
      testimonio
    });
    
  } catch (error) {
    console.error('Error al actualizar testimonio:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar testimonio',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

// Eliminar testimonio (admin o propietario)
export const deleteTestimonio = async (req, res) => {
  try {
    const { id } = req.params;
    
    const testimonio = await Testimonio.findById(id);
    
    if (!testimonio) {
      return res.status(404).json({ 
        success: false, 
        message: 'Testimonio no encontrado' 
      });
    }
    
    // Verificar si el usuario es administrador o propietario del testimonio
    if (!req.usuario.esAdmin && testimonio.usuario && testimonio.usuario.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permiso para eliminar este testimonio' 
      });
    }
    
    await Testimonio.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Testimonio eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar testimonio:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar testimonio',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};
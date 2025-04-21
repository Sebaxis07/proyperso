import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Testimonio from '../models/Testimonio.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const testimonios = await Testimonio.find()
      .sort({ fecha: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: testimonios
    });
  } catch (error) {
    console.error('Error al obtener testimonios:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al cargar testimonios' 
    });
  }
});

// Crear un nuevo testimonio (requiere autenticación)
router.post('/', protect, async (req, res) => {
  try {
    const { texto, calificacion } = req.body;

    // Validaciones básicas
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

    // Crear nuevo testimonio
    const nuevoTestimonio = new Testimonio({
      usuarioId: req.usuario.id,
      nombre: req.usuario.nombre,
      texto,
      calificacion,
      fecha: new Date(),
      imagen: req.usuario.imagen || null
    });

    await nuevoTestimonio.save();
    
    res.status(201).json({
      success: true,
      data: nuevoTestimonio
    });
  } catch (error) {
    console.error('Error al crear testimonio:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al procesar el testimonio' 
    });
  }
});

// Eliminar testimonio (solo el propio o admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const testimonio = await Testimonio.findById(req.params.id);
    
    if (!testimonio) {
      return res.status(404).json({ 
        success: false,
        message: 'Testimonio no encontrado' 
      });
    }
    
    // Verificar que el usuario es dueño del testimonio o es admin
    if (testimonio.usuarioId !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'No autorizado para eliminar este testimonio' 
      });
    }
    
    await Testimonio.findByIdAndDelete(req.params.id);
    res.status(200).json({ 
      success: true,
      message: 'Testimonio eliminado correctamente' 
    });
  } catch (error) {
    console.error('Error al eliminar testimonio:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar testimonio' 
    });
  }
});

export default router;
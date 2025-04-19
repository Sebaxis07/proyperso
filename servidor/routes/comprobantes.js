// routes/comprobantes.js
import { Router } from 'express';
const router = Router();
import Comprobante, { findById, find, countDocuments, findByIdAndUpdate, findByIdAndDelete } from '../models/comprobante';
import auth from '../middleware/auth'; // Middleware de autenticación (si lo tienes)

// Middleware para verificar si el comprobante existe
const comprobanteExists = async (req, res, next) => {
  try {
    const comprobante = await findById(req.params.id);
    if (!comprobante) {
      return res.status(404).json({ mensaje: 'Comprobante no encontrado' });
    }
    req.comprobante = comprobante;
    next();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar el comprobante', error });
  }
};

// Obtener todos los comprobantes (con filtros opcionales)
router.get('/', auth, async (req, res) => {
  try {
    const filtros = {};
    
    // Aplicar filtros si están presentes en la consulta
    if (req.query.cliente) {
      filtros['cliente.nombre'] = { $regex: req.query.cliente, $options: 'i' };
    }
    
    if (req.query.fechaDesde || req.query.fechaHasta) {
      filtros.fecha = {};
      if (req.query.fechaDesde) {
        filtros.fecha.$gte = new Date(req.query.fechaDesde);
      }
      if (req.query.fechaHasta) {
        filtros.fecha.$lte = new Date(req.query.fechaHasta);
      }
    }
    
    if (req.query.estado) {
      filtros.estado = req.query.estado;
    }
    
    // Configurar paginación
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const skip = (pagina - 1) * limite;
    
    // Ejecutar la consulta
    const comprobantes = await find(filtros)
      .sort({ fecha: -1 })
      .skip(skip)
      .limit(limite);
    
    // Contar total para paginación
    const total = await countDocuments(filtros);
    
    res.status(200).json({
      comprobantes,
      paginacion: {
        total,
        pagina,
        limite,
        paginas: Math.ceil(total / limite)
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener comprobantes', error });
  }
});

// Obtener un comprobante por ID
router.get('/:id', auth, comprobanteExists, async (req, res) => {
  res.status(200).json(req.comprobante);
});

// Crear un nuevo comprobante
router.post('/', auth, async (req, res) => {
  try {
    // Asignar el usuario que crea el comprobante (si tienes autenticación)
    if (req.user) {
      req.body.creadoPor = req.user.id;
    }
    
    const comprobante = new Comprobante(req.body);
    await comprobante.save();
    
    res.status(201).json(comprobante);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear el comprobante', error });
  }
});

// Actualizar un comprobante
router.put('/:id', auth, comprobanteExists, async (req, res) => {
  try {
    // Evitar actualizar el número si está definido
    if (req.body.numero) {
      delete req.body.numero;
    }
    
    // Actualizar el comprobante
    const comprobanteActualizado = await findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(comprobanteActualizado);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar el comprobante', error });
  }
});

// Anular un comprobante (cambiar estado a 'Anulado')
router.patch('/:id/anular', auth, comprobanteExists, async (req, res) => {
  try {
    req.comprobante.estado = 'Anulado';
    await req.comprobante.save();
    
    res.status(200).json(req.comprobante);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al anular el comprobante', error });
  }
});

// Eliminar un comprobante (generalmente no se recomienda eliminar comprobantes)
router.delete('/:id', auth, comprobanteExists, async (req, res) => {
  try {
    await findByIdAndDelete(req.params.id);
    res.status(200).json({ mensaje: 'Comprobante eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el comprobante', error });
  }
});

export default router;
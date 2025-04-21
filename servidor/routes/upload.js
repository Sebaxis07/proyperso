// routes/upload.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect, authorize } from '../middleware/auth.js';

// Configuración para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// @route   POST /api/upload
// @desc    Subir archivo de imagen
// @access  Private/Admin
router.post('/', [protect, authorize('admin')], async (req, res) => {
  try {
    // Verificar si se ha enviado un archivo
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ningún archivo'
      });
    }

    console.log('Archivos recibidos:', req.files);
    console.log('Cuerpo de la solicitud:', req.body);

    // Obtener el archivo de imagen
    const imagen = req.files.imagen;

    // Validar que es una imagen
    if (!imagen.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: 'El archivo debe ser una imagen'
      });
    }

    // Validar tamaño (5MB)
    if (imagen.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'La imagen no debe superar los 5MB'
      });
    }

    // Crear un nombre de archivo único
    const extension = path.extname(imagen.name).toLowerCase();
    const nombreArchivo = `${Date.now()}_${Math.round(Math.random() * 1E9)}${extension}`;

    // Ruta de destino
    const uploadsDir = path.join(__dirname, '../public/uploads');
    
    // Asegurarse de que el directorio existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`Directorio creado: ${uploadsDir}`);
    }
    
    const rutaArchivo = path.join(uploadsDir, nombreArchivo);
    
    console.log(`Moviendo archivo a: ${rutaArchivo}`);

    // Mover el archivo
    await imagen.mv(rutaArchivo);
    
    console.log(`Archivo guardado correctamente en: ${rutaArchivo}`);

    // Construir URL para acceder a la imagen
    // En producción, este debería ser el dominio de tu aplicación
    const host = req.get('host');
    const protocolo = req.protocol;
    let imageUrl = `${protocolo}://${host}/uploads/${nombreArchivo}`;

    // Si estamos en desarrollo y accediendo desde localhost:5175 pero la API está en localhost:5000
    // necesitamos ajustar la URL para que apunte correctamente al servidor de la API
    if (process.env.NODE_ENV !== 'production' && host.includes('5000')) {
      imageUrl = `http://localhost:5000/uploads/${nombreArchivo}`;
    }

    console.log(`URL de acceso a la imagen: ${imageUrl}`);

    return res.status(200).json({
      success: true,
      message: 'Imagen subida correctamente',
      data: {
        nombre: nombreArchivo,
        url: imageUrl
      }
    });
  } catch (err) {
    console.error('Error al subir la imagen:', err);
    return res.status(500).json({
      success: false,
      message: `Error al subir la imagen: ${err.message}`,
      error: err
    });
  }
});

export default router;
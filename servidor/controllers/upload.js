import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function uploadImage(req, res) {
  try {
    // Debug logs
    console.log('Headers:', req.headers);
    console.log('Files:', req.files);
    console.log('Body:', req.body);

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ 
        success: false,
        msg: 'No se ha subido ningún archivo' 
      });
    }

    const file = req.files.imagen;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        msg: 'El campo de archivo debe llamarse "imagen"'
      });
    }

    // Validar tipo de archivo
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        msg: 'El archivo debe ser una imagen'
      });
    }

    // Crear nombre único
    const extension = extname(file.name);
    const fileName = `${uuidv4()}${extension}`;

    // Asegurar que el directorio existe
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // Ruta completa del archivo
    const filePath = path.join(uploadDir, fileName);

    // Mover el archivo
    try {
      await file.mv(filePath);

      return res.json({
        success: true,
        data: {
          fileName,
          url: `/uploads/${fileName}`
        }
      });
    } catch (moveError) {
      console.error('Error al mover el archivo:', moveError);
      return res.status(500).json({
        success: false,
        msg: 'Error al guardar el archivo',
        error: moveError.message
      });
    }

  } catch (err) {
    console.error('Error en uploadImage:', err);
    return res.status(500).json({
      success: false,
      msg: 'Error al procesar la imagen',
      error: err.message
    });
  }
}
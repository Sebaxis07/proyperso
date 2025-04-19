import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Subir imagen
// @route   POST /api/upload
// @access  Private/Admin
export async function uploadImage(req, res) {
  console.log("🔄 Iniciando proceso de subida de imagen");
  try {
    // Verificar si hay archivo
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log("❌ No se recibieron archivos");
      return res.status(400).json({ msg: 'No se ha subido ningún archivo' });
    }

    console.log("📦 Archivos recibidos:", Object.keys(req.files));

    // Verificar si el campo 'image' existe
    if (!req.files.image) {
      console.log("❌ No se encontró campo 'image', campos disponibles:", Object.keys(req.files));
      return res.status(400).json({ msg: 'Debe enviar el archivo en el campo "image"' });
    }

    const file = req.files.image;
    console.log("📄 Archivo recibido:", file.name, file.mimetype, `${(file.size/1024/1024).toFixed(2)}MB`);

    // Verificar que es una imagen
    if (!file.mimetype.startsWith('image')) {
      console.log("❌ El archivo no es una imagen:", file.mimetype);
      return res.status(400).json({ msg: 'El archivo debe ser una imagen' });
    }

    // Verificar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log(`❌ Archivo demasiado grande: ${(file.size/1024/1024).toFixed(2)}MB (máximo ${maxSize/1024/1024}MB)`);
      return res.status(400).json({ msg: 'La imagen no debe superar los 5MB' });
    }

    // Crear nombre único
    const fileName = `${uuidv4()}${extname(file.name)}`;
    console.log("🏷️ Nombre de archivo generado:", fileName);

    // Crear directorios si no existen
    const uploadDir = join(__dirname, '../public/uploads');
    console.log("📁 Directorio de subida:", uploadDir);

    if (!existsSync(uploadDir)) {
      console.log("📁 Creando directorio de subida");
      try {
        mkdirSync(uploadDir, { recursive: true });
        console.log("✅ Directorio creado exitosamente");
      } catch (dirErr) {
        console.error("❌ Error al crear directorio:", dirErr);
        return res.status(500).json({ msg: 'Error al crear directorio de subida' });
      }
    }

    const filePath = `${uploadDir}/${fileName}`;
    console.log("📍 Ruta completa del archivo:", filePath);

    // Mover archivo de forma asíncrona con promesa
    try {
      await file.mv(filePath);
      console.log("✅ Archivo movido exitosamente");

      // Construir URL
      const fileUrl = `/uploads/${fileName}`;
      console.log("🔗 URL del archivo:", fileUrl);

      console.log("✅ Fin de la función uploadImage, respondiendo con URL:", fileUrl);
      res.json({
        success: true,
        url: fileUrl,
        fileName: fileName
      });
    } catch (mvErr) {
      console.error('❌ Error al mover el archivo:', mvErr);
      return res.status(500).json({
        msg: 'Error al subir el archivo',
        error: mvErr.message
      });
    }
  } catch (err) {
    console.error('❌ Error en uploadImage:', err);
    console.error('Stack trace:', err.stack);
    return res.status(500).json({
      msg: 'Error en el servidor',
      error: err.message
    });
  }
}
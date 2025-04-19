// servidor/config/setup-placeholder.js
// Ejecuta este script para crear una imagen placeholder en la carpeta uploads

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear directorios si no existen
const uploadDir = join(__dirname, '../public/uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// Verificar si ya existe una imagen placeholder
const placeholderPath = join(uploadDir, 'placeholder-product.jpg');

// Copiar una imagen de placeholder desde la carpeta pública del cliente 
// o crear una básica si no está disponible
console.log('Creando imagen placeholder en:', placeholderPath);
console.log('Asegúrate de tener una imagen placeholder o crea una manualmente');

// También crear un archivo index.html vacío para proteger el directorio
const indexPath = join(uploadDir, 'index.html');
writeFileSync(indexPath, '<html><body>Access denied</body></html>');
console.log('Archivo index.html creado para protección del directorio');

console.log('Configuración completada. ✅');
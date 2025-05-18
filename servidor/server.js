import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import productosRoutes from './routes/productos.js';
import pedidosRoutes from './routes/pedidos.js';
import usuariosRoutes from './routes/usuarios.js';
import uploadRoutes from './routes/upload.js';
import reportesRoutes from './routes/reportes.routes.js';
import exportRoutes from './routes/export.routes.js';
import chatbotRoutes from './routes/chatbot.js';
import testimonioRoutes from './routes/testimonio.js';
// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();

// Asegurar que el directorio de subidas existe
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Directorio de subidas creado: ${uploadsDir}`);
}

// Middleware
app.use(cors());
app.use(express.json());

// Configurar fileUpload
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'tmp'),
  debug: true,
  abortOnLimit: true,
  responseOnLimit: "Archivo demasiado grande"
}));

// Asegurarse que el directorio temporal existe
const tempDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Middleware para logging de solicitudes en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Middleware para logging de subidas de archivos
app.use((req, res, next) => {
  if (req.url.includes('/api/upload')) {
    console.log('===== SOLICITUD DE SUBIDA DE ARCHIVO =====');
    console.log(`Método: ${req.method}, URL: ${req.url}`);
    console.log('Headers:', req.headers);
    
    // Log para archivos recibidos
    if (req.files) {
      console.log('Archivos recibidos:', Object.keys(req.files));
      for (const key in req.files) {
        const file = req.files[key];
        console.log(`Archivo [${key}]:`, {
          nombre: file.name,
          tipo: file.mimetype,
          tamaño: `${(file.size / 1024).toFixed(2)} KB`,
          md5: file.md5
        });
      }
    } else {
      console.log('No se recibieron archivos');
    }
    
    console.log('======================================');
  }
  next();
});

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Servir archivos estáticos - IMPORTANTE: esto debe estar antes de las rutas API
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/reportes', exportRoutes);
app.use('/api/testimonios', testimonioRoutes);
app.use('/api/chatbot', chatbotRoutes);
 // Las rutas de exportación también están bajo /api/reportes

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Tienda de Mascotas funcionando correctamente');
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({
    success: false,
    msg: 'Error en el servidor',
    error: process.env.NODE_ENV !== 'production' ? err.message : undefined
  });
});

// Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Directorio de imágenes: ${path.join(__dirname, 'public/uploads')}`);
});
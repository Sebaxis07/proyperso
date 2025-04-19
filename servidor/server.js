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
app.use(fileUpload({
  createParentPath: true, // Crear directorios automáticamente si no existen
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  abortOnLimit: true,
  responseOnLimit: 'El archivo es demasiado grande (máximo 5MB)',
  useTempFiles: true, // Usar archivos temporales para mejor rendimiento
  tempFileDir: '/tmp/', // Directorio para archivos temporales
  debug: process.env.NODE_ENV !== 'production' // Activar logs de debug en desarrollo
}));

// Middleware para logging de solicitudes en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

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
// servidor/scripts/create-admin.js
import { connect, disconnect } from 'mongoose';
import Usuario from '../models/Usuario.js';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

// Conectar a MongoDB
connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

const createAdmin = async () => {
  try {
    // Verificar si ya existe un admin
    const adminExists = await Usuario.findOne({ rol: 'admin' });
    
    if (adminExists) {
      console.log('Ya existe un usuario administrador:');
      console.log(`Email: ${adminExists.email}`);
      console.log(`RUT: ${adminExists.rut}`);
      return;
    }
    
    // Crear nuevo administrador
    const admin = new Usuario({
      nombre: 'Admin',
      apellido: 'Sistema',
      email: 'admin@petshop.cl',
      rut: '11111111-1',
      password: 'admin123',  // Será encriptada por el middleware del modelo
      telefono: '912345678',
      direccion: {
        calle: 'Calle Principal',
        numero: '123',
        comuna: 'Santiago',
        ciudad: 'Santiago',
        region: 'Metropolitana'
      },
      rol: 'admin'
    });
    
    await admin.save();
    console.log('Administrador creado con éxito');
    console.log('Credenciales:');
    console.log('Email: admin@petshop.cl');
    console.log('Contraseña: admin123');
    console.log('RUT: 11111111-1');
  } catch (err) {
    console.error('Error al crear administrador:', err);
  } finally {
    disconnect();
  }
};

createAdmin();
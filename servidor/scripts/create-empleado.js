// servidor/scripts/create-employee.js
import mongoose from 'mongoose';
import Usuario from '../models/Usuario.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const createEmployee = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    // Verificar si ya existe un empleado con el mismo email
    const employeeExists = await Usuario.findOne({ email: 'empleado@petshop.cl' });

    if (employeeExists) {
      console.log('Ya existe un usuario empleado con este email:');
      console.log(`Email: ${employeeExists.email}`);
      console.log(`RUT: ${employeeExists.rut}`);
      return;
    }

    // Crear nuevo empleado
    const employee = new Usuario({
      nombre: 'Empleado',
      apellido: 'Sistema',
      email: 'empleado@petshop.cl',
      rut: '22222222-2',
      password: 'empleado123',  // Será encriptada por el middleware del modelo
      telefono: '987654321',
      direccion: {
        calle: 'Calle Secundaria',
        numero: '456',
        comuna: 'Providencia',
        ciudad: 'Santiago',
        region: 'Metropolitana'
      },
      rol: 'empleado'
    });

    await employee.save();
    console.log('Empleado creado con éxito');
    console.log('Credenciales:');
    console.log('Email: empleado@petshop.cl');
    console.log('Contraseña: empleado123');
    console.log('RUT: 22222222-2');
  } catch (err) {
    console.error('Error al crear empleado:', err);
  } finally {
    try {
      await mongoose.disconnect();
      console.log('Desconectado de MongoDB');
    } catch (err) {
      console.error('Error al desconectar de MongoDB:', err);
    }
  }
};

createEmployee();
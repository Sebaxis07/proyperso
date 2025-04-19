// servidor/models/Usuario.js
import { Schema, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UsuarioSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor ingrese su nombre'],
    trim: true
  },
  apellido: {
    type: String,
    required: [true, 'Por favor ingrese su apellido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Por favor ingrese su email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingrese un email válido'
    ]
  },
  rut: {
    type: String,
    required: [true, 'Por favor ingrese su RUT'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Por favor ingrese una contraseña'],
    minlength: 6,
    select: false
  },
  direccion: {
    calle: String,
    numero: String,
    comuna: String,
    ciudad: String,
    region: String,
    codigoPostal: String
  },
  telefono: {
    type: String,
    trim: true
  },
  rol: {
    type: String,
    enum: ['cliente', 'admin'],
    default: 'cliente'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encriptar contraseña usando bcrypt
UsuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
});

// Validar RUT chileno
UsuarioSchema.path('rut').validate(function(rut) {
  // Removemos puntos y guión
  rut = rut.replace(/\./g, '').replace('-', '');
  
  // Obtener dígito verificador
  const dv = rut.slice(-1).toUpperCase();
  
  // Obtener cuerpo del RUT
  const rutBody = parseInt(rut.slice(0, -1));
  
  // Calcular dígito verificador
  let suma = 0;
  let multiplicador = 2;
  
  let rutReverso = rutBody.toString().split('').reverse().join('');
  
  for (let i = 0; i < rutReverso.length; i++) {
    suma += parseInt(rutReverso.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const dvCalculado = 11 - (suma % 11);
  let dvEsperado;
  
  if (dvCalculado === 11) {
    dvEsperado = '0';
  } else if (dvCalculado === 10) {
    dvEsperado = 'K';
  } else {
    dvEsperado = dvCalculado.toString();
  }
  
  return dvEsperado === dv;
}, 'RUT inválido');

// Método para firmar JWT - Updated to use jwt.sign
UsuarioSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Método para verificar contraseña
UsuarioSchema.methods.matchPassword = async function(enteredPassword) {
  return await compare(enteredPassword, this.password);
};

export default model('Usuario', UsuarioSchema);
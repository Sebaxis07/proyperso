// servidor/models/Usuario.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UsuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor, ingrese un nombre']
  },
  apellido: {
    type: String,
    required: [true, 'Por favor, ingrese un apellido']
  },
  email: {
    type: String,
    required: [true, 'Por favor, ingrese un email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, ingrese un email válido'
    ]
  },
  rut: {
    type: String,
    required: [true, 'Por favor, ingrese un RUT'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Por favor, ingrese una contraseña'],
    minlength: 6,
    select: false
  },
  telefono: {
    type: String,
    default: null
  },
  direccion: {
    calle: {
      type: String,
      default: null
    },
    numero: {
      type: String,
      default: null
    },
    comuna: {
      type: String,
      default: null
    },
    ciudad: {
      type: String,
      default: null
    },
    region: {
      type: String,
      default: null
    }
  },
  fotoPerfil: {
    type: String,
    default: 'default-avatar.png' // Imagen por defecto
  },
  tipoFoto: {
    type: String,
    enum: ['personalizada', 'predeterminada'],
    default: 'predeterminada'
  },
  rol: {
    type: String,
    enum: ['cliente', 'empleado', 'admin'],
    default: 'cliente'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
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

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT y retornar
UsuarioSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
}

// Coincidir contraseña ingresada con contraseña encriptada en la base de datos
UsuarioSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}

export default mongoose.model('Usuario', UsuarioSchema);
import { Schema, model } from 'mongoose';

const testimonioSchema = new Schema({
  usuarioId: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  cargo: {
    type: String,
    default: 'Cliente'
  },
  texto: {
    type: String,
    required: true,
    minlength: 10
  },
  calificacion: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  imagen: {
    type: String,
    default: null // URL de la imagen de perfil del usuario
  }
});

export default model('Testimonio', testimonioSchema);
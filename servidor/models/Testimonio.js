import mongoose from 'mongoose';

const TestimonioSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',  // Mantiene la referencia al modelo Usuario
    required: false  // Cambiado a false para permitir testimonios sin usuario
  },
  nombre: {
    type: String,
    required: true
  },
  texto: {
    type: String,
    required: true,
    minlength: [10, 'El testimonio debe tener al menos 10 caracteres']
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
  cargo: {
    type: String,
    default: 'Cliente'
  },
  imagen: {
    type: String,
    default: null
  },
  aprobado: {
    type: Boolean,
    default: true  // Por defecto, aprobamos los testimonios
  }
});

export default mongoose.model('Testimonio', TestimonioSchema);
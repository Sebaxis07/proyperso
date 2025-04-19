// models/comprobante.js
import { Schema, model } from 'mongoose';

// Esquema para los detalles del comprobante
const DetalleSchema = new Schema({
  descripcion: {
    type: String,
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 0
  },
  precioUnitario: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

// Esquema principal del comprobante
const ComprobanteSchema = new Schema({
  numero: {
    type: String,
    required: true,
    unique: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  cliente: {
    nombre: {
      type: String,
      required: true
    },
    identificacion: String,
    direccion: String,
    telefono: String,
    email: String
  },
  detalles: [DetalleSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  impuestos: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  estado: {
    type: String,
    enum: ['Pagado', 'Pendiente', 'Anulado'],
    default: 'Pagado'
  },
  metodoPago: {
    type: String,
    enum: ['Efectivo', 'Tarjeta', 'Transferencia', 'Otro'],
    default: 'Efectivo'
  },
  notas: String,
  // Campo para almacenar referencia al usuario que creó el comprobante
  creadoPor: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario'
  }
}, {
  timestamps: true // Añade campos createdAt y updatedAt automáticamente
});

// Añadir índices para mejorar la búsqueda
ComprobanteSchema.index({ numero: 1 });
ComprobanteSchema.index({ 'cliente.nombre': 1 });
ComprobanteSchema.index({ fecha: -1 });

// Middleware pre-save para calcular total si no está definido
ComprobanteSchema.pre('save', function(next) {
  if (this.detalles && this.detalles.length > 0) {
    // Calcular subtotal
    this.subtotal = this.detalles.reduce((acc, detalle) => acc + detalle.subtotal, 0);
    // Calcular total
    this.total = this.subtotal + this.impuestos;
  }
  next();
});

export default model('Comprobante', ComprobanteSchema);
// servidor/models/Pedido.js
import mongoose from 'mongoose';

const EventoSeguimientoSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    required: true
  }
});

const SeguimientoSchema = new mongoose.Schema({
  numeroSeguimiento: {
    type: String,
    required: true
  },
  empresa: {
    type: String,
    required: true
  },
  fechaEnvio: {
    type: Date,
    default: Date.now
  },
  urlSeguimiento: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  historia: [EventoSeguimientoSchema]
});

const PedidoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  productos: [
    {
      producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
      },
      cantidad: {
        type: Number,
        required: true,
        min: [1, 'La cantidad mínima es 1']
      },
      precioUnitario: {
        type: Number,
        required: true
      },
      subtotal: {
        type: Number,
        required: true
      }
    }
  ],
  direccionEnvio: {
    calle: String,
    numero: String,
    comuna: String,
    ciudad: String,
    region: String,
    codigoPostal: String
  },
  estadoPedido: {
    type: String,
    enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  metodoPago: {
    type: String,
    required: true,
    enum: ['webpay', 'transferencia', 'efectivo']
  },
  estadoPago: {
    type: String,
    enum: ['pendiente', 'pagado', 'rechazado'],
    default: 'pendiente'
  },
  subtotal: {
    type: Number,
    required: true
  },
  costoEnvio: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  numeroPedido: {
    type: String,
    unique: true
  },
  comprobantePago: {
    type: String
  },
  // Nuevo campo para seguimiento
  seguimiento: SeguimientoSchema,
  // Campo para registrar quién procesa el pedido (empleado)
  procesadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  notasInternas: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generar número de pedido único
PedidoSchema.pre('save', async function(next) {
  if (!this.numeroPedido) {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().substr(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const random = Math.floor(10000 + Math.random() * 90000);
    
    this.numeroPedido = `PM-${año}${mes}${dia}-${random}`;
  }
  
  // Actualizar fecha de modificación
  this.updatedAt = Date.now();
  
  next();
});

let Pedido;

try {
  // Intenta obtener el modelo si ya está definido
  Pedido = mongoose.model('Pedido');
} catch (e) {
  // Si el modelo no está definido, créalo
  if (e.name === 'MissingSchemaError') {
    Pedido = mongoose.model('Pedido', PedidoSchema);
  } else {
    throw e;
  }
}

export default Pedido;
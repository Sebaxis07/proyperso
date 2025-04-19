// servidor/models/Pedido.js
import { Schema, model } from 'mongoose';

const PedidoSchema = new Schema({
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  productos: [
    {
      producto: {
        type: Schema.Types.ObjectId,
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
  createdAt: {
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
  next();
});

export default model('Pedido', PedidoSchema);
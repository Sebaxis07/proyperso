import mongoose from 'mongoose';

const SolicitudCancelacionSchema = new mongoose.Schema({
  pedido: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pedido',
    required: true
  },
  empleado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true // Make empleado required
  },
  motivo: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobada', 'rechazada'],
    default: 'pendiente'
  },
  fechaSolicitud: {
    type: Date,
    default: Date.now
  },
  fechaResolucion: Date,
  comentarioResolucion: String
});

export default mongoose.model('SolicitudCancelacion', SolicitudCancelacionSchema);
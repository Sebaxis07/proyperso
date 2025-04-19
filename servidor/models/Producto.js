// servidor/models/Producto.js
import { Schema, model } from 'mongoose';

const ProductoSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor ingrese el nombre del producto'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'Por favor ingrese una descripción']
  },
  precio: {
    type: Number,
    required: [true, 'Por favor ingrese el precio']
  },
  categoria: {
    type: String,
    required: [true, 'Por favor seleccione una categoría'],
    enum: [
      'alimentos',
      'accesorios',
      'higiene',
      'juguetes',
      'medicamentos',
      'camas',
      'transportadoras',
      'otros'
    ]
  },
  tipoMascota: {
    type: String,
    required: [true, 'Por favor seleccione el tipo de mascota'],
    enum: [
      'perro',
      'gato',
      'ave',
      'pez',
      'roedor',
      'reptil',
      'otro'
    ]
  },
  imagen: {
    nombre: {
      type: String,
      default: 'no-image.jpg'
    },
    url: {
      type: String,
      default: 'no-image.jpg'
    },
    contentType: {
      type: String,
      default: 'image/jpeg'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Por favor ingrese la cantidad en stock'],
    min: [0, 'El stock no puede ser negativo']
  },
  destacado: {
    type: Boolean,
    default: false
  },
  enOferta: {
    type: Boolean,
    default: false
  },
  descuento: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Método virtual para la URL completa de la imagen
ProductoSchema.virtual('imagenUrlCompleta').get(function() {
  return `${process.env.BASE_URL}/uploads/productos/${this.imagen.nombre}`;
});

// Asegurarse que los virtuals se incluyan en la respuesta JSON
ProductoSchema.set('toJSON', { virtuals: true });
ProductoSchema.set('toObject', { virtuals: true });

export default model('Producto', ProductoSchema);
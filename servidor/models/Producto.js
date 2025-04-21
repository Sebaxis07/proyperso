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
      'medicamentos y cuidado',
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
  // Añadir el campo imagenUrl que estás usando en el controlador
  imagenUrl: {
    type: String,
    default: ''
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

// Función auxiliar para determinar el tipo de contenido basado en la extensión del archivo
const getContentType = (filename) => {
  if (!filename) return 'image/jpeg';
  
  const ext = filename.split('.').pop().toLowerCase();
  const contentTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
  };
  
  return contentTypes[ext] || 'image/jpeg';
};

// Método virtual mejorado para la URL completa de la imagen
ProductoSchema.virtual('imagenUrlCompleta').get(function() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  
  // Si hay una URL directa de imagen, usarla primero
  if (this.imagenUrl) {
    return this.imagenUrl.startsWith('http') 
      ? this.imagenUrl 
      : `${baseUrl}${this.imagenUrl.startsWith('/') ? this.imagenUrl : `/${this.imagenUrl}`}`;
  }
  
  // Si hay una URL en el objeto imagen, usarla
  if (this.imagen && this.imagen.url && this.imagen.url !== 'no-image.jpg') {
    return this.imagen.url.startsWith('http')
      ? this.imagen.url
      : `${baseUrl}${this.imagen.url.startsWith('/') ? this.imagen.url : `/${this.imagen.url}`}`;
  }
  
  // Si hay un nombre de archivo en el objeto imagen, construir la URL
  if (this.imagen && this.imagen.nombre && this.imagen.nombre !== 'no-image.jpg') {
    return `${baseUrl}/uploads/productos/${this.imagen.nombre}`;
  }
  
  // Intentar construir una URL basada en el ID del producto
  if (this._id) {
    return `${baseUrl}/uploads/${this._id}.jpg`;
  }
  
  // Imagen por defecto
  return `${baseUrl}/placeholder-product.jpg`;
});

// Método para sincronizar imagenUrl con el objeto imagen
ProductoSchema.pre('save', function(next) {
  // Si se actualizó imagenUrl pero no el objeto imagen, sincronizarlos
  if (this.imagenUrl && this.isModified('imagenUrl')) {
    const urlParts = this.imagenUrl.split('/');
    const nombreImagen = urlParts[urlParts.length - 1];
    
    this.imagen = {
      nombre: nombreImagen,
      url: this.imagenUrl,
      contentType: getContentType(nombreImagen)
    };
  }
  
  // Si se actualizó imagen.url pero no imagenUrl, sincronizarlos
  if (this.imagen && this.imagen.url && this.imagen.url !== 'no-image.jpg' && 
      this.isModified('imagen.url') && !this.isModified('imagenUrl')) {
    this.imagenUrl = this.imagen.url;
  }
  
  next();
});

// Asegurarse que los virtuals se incluyan en la respuesta JSON
ProductoSchema.set('toJSON', { virtuals: true });
ProductoSchema.set('toObject', { virtuals: true });

export default model('Producto', ProductoSchema);
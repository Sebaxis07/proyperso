// utils/imageUtils.js
/**
 * Obtiene la URL completa de la imagen de un producto, manejando diferentes formatos
 * @param {Object} producto - El objeto producto que contiene los datos de la imagen
 * @param {String} placeholderImage - URL de la imagen de reemplazo (opcional)
 * @returns {String} URL completa de la imagen
 */
export const getFullImageUrl = (producto, placeholderImage = '/placeholder-product.jpg') => {
    // Para depuración
    console.log("Procesando imagen para producto ID:", producto?._id);
    
    if (!producto) return placeholderImage;
    
    // 1. Verificar si existe la propiedad imagenUrl directa (como se guarda en tu controlador)
    if (producto.imagenUrl) {
      console.log("Encontrada imagenUrl:", producto.imagenUrl);
      
      // Si ya es una URL completa (comienza con http)
      if (producto.imagenUrl.startsWith('http')) {
        return producto.imagenUrl;
      }
      
      // Si es una ruta relativa
      const path = producto.imagenUrl.startsWith('/') 
        ? producto.imagenUrl 
        : `/${producto.imagenUrl}`;
      
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const fullUrl = `${baseUrl}${path}`;
      console.log("URL construida:", fullUrl);
      return fullUrl;
    }
    
    // 2. Verificar si existe la propiedad imagen anidada (estructura del esquema Mongoose)
    if (producto.imagen) {
      console.log("Encontrada propiedad imagen:", producto.imagen);
      
      // Si tiene URL directa en la propiedad imagen
      if (producto.imagen.url && producto.imagen.url !== 'no-image.jpg') {
        const imageUrl = producto.imagen.url;
        console.log("Usando imagen.url:", imageUrl);
        
        // Si ya es una URL completa
        if (imageUrl.startsWith('http')) {
          return imageUrl;
        }
        
        // Si es una ruta relativa
        const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const fullUrl = `${baseUrl}${path}`;
        console.log("URL construida:", fullUrl);
        return fullUrl;
      }
      
      // Si tiene nombre pero no URL
      if (producto.imagen.nombre && producto.imagen.nombre !== 'no-image.jpg') {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const fullUrl = `${baseUrl}/uploads/productos/${producto.imagen.nombre}`;
        console.log("URL construida desde nombre:", fullUrl);
        return fullUrl;
      }
    }
    
    // 3. Verificar si existe la propiedad imagenUrlCompleta (virtual)
    if (producto.imagenUrlCompleta) {
      console.log("Usando imagenUrlCompleta:", producto.imagenUrlCompleta);
      return producto.imagenUrlCompleta;
    }
    
    // 4. NUEVO: Verificar la estructura directa de la URL de la imagen en los uploads
    // Basado en los logs de error, parece que las imágenes están guardadas en /uploads con el nombre del archivo
    if (producto._id) {
      // Intentar construir la URL basada en los datos del servidor
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Intentar con la estructura de URL que podría estar usando el servidor
      const guessedUrl = `${baseUrl}/uploads/${producto._id}.jpg`;
      console.log("Intentando URL basada en ID:", guessedUrl);
      return guessedUrl;
    }
    
    // 5. Si nada funcionó, usar imagen predeterminada
    console.log("Ninguna propiedad de imagen válida encontrada, usando placeholder");
    return placeholderImage;
  };
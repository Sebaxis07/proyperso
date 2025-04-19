// cliente/src/components/productos/ProductCard.jsx
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

const ProductCard = ({ producto }) => {
  const { addToCart } = useContext(CartContext);
  const [imageError, setImageError] = useState(false);
  
  // Calcular precio con descuento si está en oferta
  const precioFinal = producto.enOferta 
    ? producto.precio * (1 - producto.descuento / 100) 
    : producto.precio;
  
  // Formatear precio como moneda chilena
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(producto);
  };

  // Determinar la URL de la imagen o usar placeholder
  const placeholderImage = '/placeholder-product.jpg';

  // Función para obtener la URL completa de la imagen
  const getFullImageUrl = () => {
    if (!producto.imagenUrl || imageError) {
      return placeholderImage;
    }
    
    // Si ya es una URL completa
    if (producto.imagenUrl.startsWith('http')) {
      return producto.imagenUrl;
    }
    
    // Si es una ruta relativa
    // Aseguramos que comience con / para que sea una ruta absoluta desde el dominio
    const url = producto.imagenUrl.startsWith('/') 
      ? producto.imagenUrl 
      : `/${producto.imagenUrl}`;
      
    // Obtenemos la URL base del backend desde las variables de entorno
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Construimos la URL completa
    return `${baseUrl}${url}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link to={`/productos/${producto._id}`} className="block">
        <div className="relative h-48 bg-gray-200">
          {/* Imagen con manejo de errores */}
          <img
            src={getFullImageUrl()}
            alt={producto.nombre}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {producto.enOferta && (
              <span className="badge badge-red">
                {producto.descuento}% OFF
              </span>
            )}
            
            {producto.destacado && (
              <span className="badge badge-yellow">
                Destacado
              </span>
            )}
            
            {producto.stock <= 5 && producto.stock > 0 && (
              <span className="badge badge-blue">
                ¡Últimas unidades!
              </span>
            )}
            
            {producto.stock === 0 && (
              <span className="badge badge-red">
                Agotado
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{producto.nombre}</h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <span className="capitalize">{producto.tipoMascota}</span>
            <span className="mx-2">•</span>
            <span className="capitalize">{producto.categoria}</span>
          </div>
          
          <div className="flex justify-between items-end mt-4">
            <div>
              {producto.enOferta ? (
                <div>
                  <span className="text-gray-500 line-through text-sm">
                    {formatPrice(producto.precio)}
                  </span>
                  <div className="text-xl font-bold text-primary-600">
                    {formatPrice(precioFinal)}
                  </div>
                </div>
              ) : (
                <div className="text-xl font-bold text-primary-600">
                  {formatPrice(producto.precio)}
                </div>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={producto.stock === 0}
              className={`p-2 rounded-full ${
                producto.stock === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
              title={producto.stock === 0 ? 'Producto agotado' : 'Añadir al carrito'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
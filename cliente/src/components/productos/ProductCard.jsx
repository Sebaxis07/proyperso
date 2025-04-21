import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

const ProductCard = ({ producto }) => {
  const { addToCart } = useContext(CartContext);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const precioFinal = producto.enOferta 
    ? producto.precio * (1 - producto.descuento / 100) 
    : producto.precio;
  
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

  const placeholderImage = '/placeholder-product.jpg';

  const getFullImageUrl = () => {
    if (!producto.imagenUrl || imageError) {
      return placeholderImage;
    }
    
    if (producto.imagenUrl.startsWith('http')) {
      return producto.imagenUrl;
    }
    
    const url = producto.imagenUrl.startsWith('/') 
      ? producto.imagenUrl 
      : `/${producto.imagenUrl}`;
      
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    return `${baseUrl}${url}`;
  };

  return (
    <div 
      className="bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/productos/${producto._id}`} className="block relative">
        <div className="relative h-72 bg-gray-100 overflow-hidden">
          <img
            src={getFullImageUrl()}
            alt={producto.nombre}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {producto.enOferta && (
              <span className="px-4 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm bg-opacity-90 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {producto.descuento}% OFF
              </span>
            )}
            
            {producto.destacado && (
              <span className="px-4 py-1.5 bg-yellow-500 text-white text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm bg-opacity-90 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Destacado
              </span>
            )}
            
            {producto.stock <= 5 && producto.stock > 0 && (
              <span className="px-4 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm bg-opacity-90 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                ¡Últimas unidades!
              </span>
            )}
            
            {producto.stock === 0 && (
              <span className="px-4 py-1.5 bg-gray-700 text-white text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm bg-opacity-90 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Agotado
              </span>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium capitalize">{producto.tipoMascota}</span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium capitalize">{producto.categoria}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 h-[56px]">{producto.nombre}</h3>
          <div className="flex justify-between items-center mt-5">
            <div>
              {producto.enOferta ? (
                <div className="flex flex-col">
                  <span className="text-gray-500 line-through text-sm mb-1">
                    {formatPrice(producto.precio)}
                  </span>
                  <div className="text-xl font-bold text-[#FFB100]">
                    {formatPrice(precioFinal)}
                  </div>
                </div>
              ) : (
                <div className="text-xl font-bold text-[#FFB100]">
                  {formatPrice(producto.precio)}
                </div>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={producto.stock === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                producto.stock === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#FFD15C] hover:bg-[#FFB100] text-white shadow-md hover:shadow-xl hover:scale-110'
              }`}
              title={producto.stock === 0 ? 'Producto agotado' : 'Añadir al carrito'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
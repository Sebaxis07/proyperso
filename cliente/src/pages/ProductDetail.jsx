// cliente/src/pages/ProductDetail.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true);
        setImageError(false); // Reset image error state on new product load
        const res = await axios.get(`/api/productos/${id}`);
        setProducto(res.data.data);
        
        // Obtener productos relacionados
        const resRelacionados = await axios.get(
          `/api/productos?categoria=${res.data.data.categoria}&tipoMascota=${res.data.data.tipoMascota}&limit=4`
        );
        
        // Filtrar el producto actual de los relacionados
        const relacionadosFiltrados = resRelacionados.data.data.filter(
          (prod) => prod._id !== id
        );
        
        setProductosRelacionados(relacionadosFiltrados.slice(0, 4));
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el producto:', err);
        setError('No se pudo cargar el producto. Por favor, intenta nuevamente más tarde.');
        setLoading(false);
      }
    };

    fetchProducto();
    // Resetear cantidad cuando cambie el ID
    setCantidad(1);
  }, [id]);

  // Formatear precio como moneda chilena
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  // Calcular precio con descuento si está en oferta
  const precioFinal = producto?.enOferta 
    ? producto.precio * (1 - producto.descuento / 100) 
    : producto?.precio;

  // Manejar cambio de cantidad
  const handleCantidadChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (producto?.stock || 1)) {
      setCantidad(value);
    }
  };

  // Incrementar cantidad
  const incrementarCantidad = () => {
    if (cantidad < (producto?.stock || 1)) {
      setCantidad(cantidad + 1);
    }
  };

  // Decrementar cantidad
  const decrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  // Agregar al carrito
  const handleAddToCart = () => {
    addToCart(producto, cantidad);
  };

  // Determinar la URL de la imagen o usar placeholder
  const placeholderImage = '/placeholder-product.jpg';

  // Función para obtener la URL completa de la imagen
  const getFullImageUrl = (imagenUrl) => {
    if (!imagenUrl || (imagenUrl === producto?.imagenUrl && imageError)) {
      return placeholderImage;
    }
    
    // Si ya es una URL completa
    if (imagenUrl.startsWith('http')) {
      return imagenUrl;
    }
    
    // Si es una ruta relativa
    // Aseguramos que comience con / para que sea una ruta absoluta desde el dominio
    const url = imagenUrl.startsWith('/') 
      ? imagenUrl 
      : `/${imagenUrl}`;
      
    // Obtenemos la URL base del backend desde las variables de entorno
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Construimos la URL completa
    return `${baseUrl}${url}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-8">
        <p>{error}</p>
        <Link to="/productos" className="text-primary-600 hover:underline mt-4 inline-block">
          Volver a productos
        </Link>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
        <Link to="/productos" className="text-primary-600 hover:underline">
          Volver a productos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb mejorado */}
        <nav className="flex items-center space-x-2 text-sm mb-12 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-100">
          <Link to="/" className="text-gray-500 hover:text-[#FFD15C] transition-colors duration-200 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Inicio
          </Link>
          <svg className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <Link to="/productos" className="text-gray-500 hover:text-[#FFD15C] transition-colors duration-200">
            Productos
          </Link>
          <svg className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-[#FFD15C] font-medium">{producto.nombre}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Galería de imágenes mejorada */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-white rounded-3xl shadow-lg overflow-hidden group">
              <img 
                src={getFullImageUrl(producto.imagenUrl)}
                alt={producto.nombre}
                className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700"
                onError={() => setImageError(true)}
              />
              {producto.enOferta && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold shadow-lg">
                  -{producto.descuento}%
                </div>
              )}
            </div>
          </div>

          {/* Información del producto mejorada */}
          <div className="bg-white rounded-3xl shadow-lg p-8 lg:p-12 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-800">{producto.nombre}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 capitalize hover:bg-[#FFD15C] hover:text-white transition-all duration-300">
                  {producto.categoria}
                </span>
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 capitalize hover:bg-[#FFD15C] hover:text-white transition-all duration-300">
                  {producto.tipoMascota}
                </span>
              </div>
            </div>

            {/* Precio y descuento mejorados */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              {producto.enOferta ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through text-xl">
                      {formatPrice(producto.precio)}
                    </span>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                      -{producto.descuento}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-extrabold text-[#FFD15C]">
                      {formatPrice(precioFinal)}
                    </span>
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
                      Ahorras {formatPrice(producto.precio - precioFinal)}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-4xl font-extrabold text-[#FFD15C]">
                  {formatPrice(producto.precio)}
                </span>
              )}
            </div>

            {/* Stock y disponibilidad mejorados */}
            {producto.stock > 0 ? (
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="h-4 w-4 bg-green-500 rounded-full absolute animate-ping"></span>
                    <span className="h-4 w-4 bg-green-500 rounded-full relative inline-flex"></span>
                  </div>
                  <span className="text-green-800 font-medium text-lg">
                    {producto.stock > 10 
                      ? 'Stock disponible' 
                      : `¡Solo quedan ${producto.stock} unidades!`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800 font-medium text-lg">
                    Temporalmente agotado
                  </span>
                </div>
              </div>
            )}

            {/* Selector de cantidad y botón de compra mejorados */}
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-gray-600 font-medium">Cantidad</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={decrementarCantidad}
                    disabled={cantidad <= 1}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-xl font-bold text-gray-800 w-12 text-center">
                    {cantidad}
                  </span>
                  <button
                    onClick={incrementarCantidad}
                    disabled={cantidad >= producto.stock}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={producto.stock === 0}
                className="w-full group bg-[#FFD15C] hover:bg-[#FFC132] disabled:bg-gray-200 text-white disabled:text-gray-500 rounded-2xl py-4 px-8 font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:hover:transform-none flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6 transform group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {producto.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
              </button>
            </div>
          </div>
        </div>

        {/* Productos Relacionados */}
        {productosRelacionados.length > 0 && (
          <div className="mt-16 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 relative">
              Productos Relacionados
              <div className="absolute bottom-0 left-0 w-24 h-1 bg-[#FFD15C] rounded-full"></div>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productosRelacionados.map((prod) => (
                <Link
                  key={prod._id}
                  to={`/productos/${prod._id}`}
                  className="group bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative h-48">
                    <img
                      src={getFullImageUrl(prod.imagenUrl)}
                      alt={prod.nombre}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = placeholderImage;
                      }}
                    />
                    {prod.enOferta && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                        {prod.descuento}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-[#FFD15C] transition-colors duration-200">
                      {prod.nombre}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 capitalize">
                        {prod.tipoMascota}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 capitalize">
                        {prod.categoria}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      {prod.enOferta ? (
                        <>
                          <span className="text-gray-400 line-through text-sm">
                            {formatPrice(prod.precio)}
                          </span>
                          <span className="text-xl font-bold text-[#FFD15C]">
                            {formatPrice(prod.precio * (1 - prod.descuento / 100))}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-[#FFD15C]">
                          {formatPrice(prod.precio)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
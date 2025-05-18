import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { getFullImageUrl } from '../utils/imageUtils';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const [destacados, setDestacados] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const placeholderImage = '/placeholder-product.jpg';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [resDestacados, resOfertas] = await Promise.all([
          axios.get('/api/productos?destacado=true&limit=4'),
          axios.get('/api/productos?enOferta=true&limit=4')
        ]);
        
        setDestacados(resDestacados.data.data);
        setOfertas(resOfertas.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError('Hubo un problema al cargar los productos. Por favor, intenta nuevamente más tarde.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categorias = [
    {
      id: 'alimentos',
      nombre: 'Alimentos',
      imagen: 'src/img/alimentos.jpeg',
      descripcion: 'La mejor nutrición para tu mascota',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h18v18H3V3zm4.5 7.5a3 3 0 013-3h3a3 3 0 013 3v3a3 3 0 01-3 3h-3a3 3 0 01-3-3v-3z" />
        </svg>
      )
    },
    {
      id: 'accesorios',
      nombre: 'Accesorios',
      imagen: 'src/img/accesorios.webp',
      descripcion: 'Todo lo que necesita tu amigo peludo',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v10m0 0l-3-3m3 3l3-3m-9 3h6m4 0h3m-3 4.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
      )
    },
    {
      id: 'juguetes',
      nombre: 'Juguetes',
      imagen: 'src/img/juguetes.jpeg',
      descripcion: 'Diversión y entretenimiento para tus mascotas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
        </svg>
      )
    },
    {
      id: 'higiene',
      nombre: 'Higiene y Cuidado',
      imagen: 'src/img/higiene.jpg',
      descripcion: 'Productos para mantener a tu mascota limpia y saludable',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    }
  ];

  const tiposMascotas = [
    { 
      id: 'perro', 
      nombre: 'Perros', 
      imagen: 'src/img/perro.webp',
      color: 'bg-blue-50'
    },
    { 
      id: 'gato', 
      nombre: 'Gatos', 
      imagen: 'src/img/gatos.avif',
      color: 'bg-purple-50'
    },
    { 
      id: 'ave', 
      nombre: 'Aves', 
      imagen: 'src/img/aves.webp',
      color: 'bg-green-50'
    },
    { 
      id: 'pez', 
      nombre: 'Peces', 
      imagen: 'src/img/peces.jpg',
      color: 'bg-cyan-50'
    },
    { 
      id: 'roedor', 
      nombre: 'Roedores', 
      imagen: 'src/img/roedores.jpg',
      color: 'bg-orange-50'
    },
    { 
      id: 'reptil', 
      nombre: 'Reptiles', 
      imagen: 'src/img/reptiles.jpg',
      color: 'bg-lime-50'
    }
  ];

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const ProductCard = ({ producto }) => {
    const precioFinal = producto.enOferta 
      ? producto.precio * (1 - producto.descuento / 100) 
      : producto.precio;

    return (
      <motion.div variants={fadeInUp}>
        <Link
          to={`/productos/${producto._id}`}
          className="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 flex flex-col h-full"
        >
          <div className="relative h-52 overflow-hidden">
            <img
              src={getFullImageUrl(producto, placeholderImage)}
              alt={producto.nombre}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />
            {producto.enOferta && (
              <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                {producto.descuento}% OFF
              </div>
            )}
            {producto.destacado && !producto.enOferta && (
              <div className="absolute top-3 right-3 bg-amber-400 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                Destacado
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-lg font-semibold line-clamp-1">{producto.nombre}</h3>
            </div>
          </div>
          
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-amber-500 transition-colors duration-200">
              {producto.nombre}
            </h3>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 capitalize">
                {producto.tipoMascota}
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 capitalize">
                {producto.categoria}
              </span>
            </div>
            
            <div className="mt-auto">
              <div className="flex items-baseline gap-2">
                {producto.enOferta ? (
                  <>
                    <span className="text-gray-400 line-through text-sm">
                      {formatPrice(producto.precio)}
                    </span>
                    <span className="text-xl font-bold text-amber-500">
                      {formatPrice(precioFinal)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-amber-500">
                    {formatPrice(producto.precio)}
                  </span>
                )}
              </div>
              
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-amber-600 font-medium text-sm inline-flex items-center">
                  Ver detalles
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-200"></div>
        <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-amber-500 border-t-transparent"></div>
      </div>
    </div>
  );

  const ErrorMessage = ({ message }) => (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <motion.section 
        className="relative min-h-[650px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white py-20 mb-16 rounded-3xl overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Blob decorations */}
        <div className="absolute left-0 top-0 w-96 h-96 bg-white opacity-5 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-white opacity-5 rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        
        {/* Dots pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', 
            backgroundSize: '30px 30px' 
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 flex items-center h-full">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="flex items-center mb-4"
            >
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-medium">
                La Tienda N°1 de Mascotas en Chile
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Tu mascota merece lo mejor
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-white/90 font-light"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Encuentra todo lo que necesitan tus amigos peludos con los mejores precios y calidad garantizada. Envíos a todo Chile.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Link 
                to="/productos" 
                className="bg-white text-amber-500 hover:bg-gray-50 py-4 px-8 rounded-full font-bold text-center text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Explorar Productos</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link 
                to="/productos?enOferta=true" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 py-4 px-8 rounded-full font-bold text-center text-lg transition-all duration-300"
              >
                Ver Ofertas
              </Link>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-6 mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-white font-bold text-xs">99%</div>
                <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold text-xs">24h</div>
                <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold text-xs">★★★★★</div>
              </div>
              <span className="text-white/80 text-sm">Más de 10.000 clientes satisfechos</span>
            </motion.div>
          </div>
          
          <motion.div 
            className="hidden lg:block absolute right-12 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <img 
              src="/src/img/happy.webp" 
              alt="Mascota feliz" 
              className="w-[550px] h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Features section */}
      <section className="container mx-auto px-4 mb-24">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
            variants={fadeInUp}
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Envío Gratis</h3>
            <p className="text-gray-600">En pedidos superiores a $25.000 a todo Chile</p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
            variants={fadeInUp}
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Entrega Rápida</h3>
            <p className="text-gray-600">Recibe tu pedido en 24-48 horas</p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
            variants={fadeInUp}
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Garantía de Calidad</h3>
            <p className="text-gray-600">Productos certificados y de alta calidad</p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
            variants={fadeInUp}
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Soporte 24/7</h3>
            <p className="text-gray-600">Asistencia veterinaria disponible</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <motion.section 
        className="container mx-auto px-4 mb-24"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="flex justify-between items-center mb-10">
          <motion.div variants={fadeInUp}>
            <span className="text-amber-500 font-medium mb-2 block">Encuentra lo que buscas</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Categorías Populares
            </h2>
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <Link 
              to="/productos" 
              className="text-amber-500 hover:text-amber-600 font-semibold flex items-center gap-2 group bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
            >
              Ver todas
              <svg 
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categorias.map((categoria, index) => (
            <motion.div
              key={categoria.id}
              variants={fadeInUp}
            >
              <Link 
                to={`/productos?categoria=${categoria.id}`}
                className="group flex flex-col h-full bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="h-48 bg-gray-100 overflow-hidden relative">
                  <img 
                    src={categoria.imagen} 
                    alt={categoria.nombre}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 filter group-hover:brightness-110" 
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">{categoria.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-amber-500 transition-colors">
                    {categoria.nombre}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {categoria.descripcion}
                  </p>
                  <div className="mt-auto">
                    <span className="text-amber-500 font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      Explorar
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Pet Types Section */}
      <motion.section 
        className="container mx-auto px-4 mb-24"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <span className="text-amber-500 font-medium mb-2 block">Para cada amigo</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tienda por Tipo de Mascota</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tenemos todo lo que necesitas para cualquier tipo de mascota, desde los más pequeños hasta los más exóticos
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {tiposMascotas.map((tipo, index) => (
            <motion.div
              key={tipo.id}
              variants={fadeInUp}
            >
              <Link 
                to={`/productos?tipoMascota=${tipo.id}`}
                className={`${tipo.color} rounded-xl shadow-sm p-6 flex flex-col items-center justify-center hover:shadow-md transition-all text-center transform hover:-translate-y-1 h-full`}
              >
                <div className="w-20 h-20 rounded-full bg-white shadow-md mb-4 overflow-hidden p-1">
                  <img 
                    src={tipo.imagen} 
                    alt={tipo.nombre}
                    className="w-full h-full object-cover rounded-full" 
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
                  />
                </div>
                <h3 className="font-medium text-gray-800 text-lg">{tipo.nombre}</h3>
                <span className="mt-2 text-amber-500 flex items-center text-sm font-medium opacity-0 hover:opacity-100 transition-opacity">
                  Ver productos
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Products Section */}
      <motion.section 
        className="container mx-auto px-4 mb-24"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex justify-between items-center mb-10">
          <motion.div variants={fadeInUp}>
            <span className="text-amber-500 font-medium mb-2 block">Lo más selecto</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Productos Destacados
            </h2>
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <Link 
              to="/productos?destacado=true" 
              className="text-amber-500 hover:text-amber-600 font-semibold flex items-center gap-2 group bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
            >
              Ver más
              <svg 
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
        
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : destacados.length === 0 ? (
          <motion.div 
            className="text-center py-12 bg-white rounded-xl shadow-sm"
            variants={fadeInUp}
          >
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500 text-lg">No hay productos destacados disponibles en este momento.</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {destacados.map((producto) => (
              <ProductCard key={producto._id} producto={producto} />
            ))}
          </motion.div>
        )}
      </motion.section>

      {/* Special Offers Section */}
      <motion.section 
        className="container mx-auto px-4 mb-24"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex justify-between items-center mb-10">
          <motion.div variants={fadeInUp}>
            <span className="text-amber-500 font-medium mb-2 block">Aprovecha ahora</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Ofertas Especiales
            </h2>
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <Link 
              to="/productos?enOferta=true" 
              className="text-amber-500 hover:text-amber-600 font-semibold flex items-center gap-2 group bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
            >
              Ver más
              <svg 
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
        
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : ofertas.length === 0 ? (
          <motion.div 
            className="text-center py-12 bg-white rounded-xl shadow-sm"
            variants={fadeInUp}
          >
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg">No hay ofertas disponibles en este momento.</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {ofertas.map((producto) => (
              <ProductCard key={producto._id} producto={producto} />
            ))}
          </motion.div>
        )}
      </motion.section>

    
      {/* CTA Section (Logged in or Not) */}
      {currentUser ? (
        <motion.section 
          className="bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-3xl p-10 mb-24 overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Decorative elements */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white opacity-10 rounded-full"></div>
          <div className="absolute left-10 -top-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                ¡Bienvenido de nuevo, {currentUser.nombre}!
              </h2>
              <p className="text-white/90 text-lg max-w-2xl">
                Explora nuestras nuevas ofertas y productos destacados. ¡Aprovecha los beneficios exclusivos para miembros!
              </p>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Puntos acumulados: 250</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Nivel: Premium</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 flex-wrap">
              <Link 
                to="/perfil" 
                className="bg-white text-amber-500 hover:bg-gray-50 py-3 px-6 rounded-xl font-bold text-center inline-flex items-center gap-2 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Mi Perfil
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              
              <Link 
                to="/pedidos" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 py-3 px-6 rounded-xl font-bold text-center inline-flex items-center gap-2 transition-all duration-300"
              >
                Mis Compras
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </Link>
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.section 
          className="bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-3xl p-10 mb-24 overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Decorative elements */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white opacity-10 rounded-full"></div>
          <div className="absolute left-10 -top-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
            <div className="md:max-w-xl">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                ¡Únete a nuestro programa de fidelidad!
              </motion.h2>
              
              <motion.p 
                className="text-white/90 text-lg mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Obtén descuentos exclusivos, acumula puntos en cada compra y disfruta de beneficios especiales para miembros.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4 mt-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Ahorra hasta un 15%</span>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span>Envío gratis siempre</span>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Asesoría veterinaria</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl w-full md:max-w-md"
            >
              <h3 className="text-xl font-bold mb-4">Regístrate Gratis</h3>
              <div className="space-y-4">
                <Link 
                  to="/register" 
                  className="bg-white text-amber-500 hover:bg-gray-50 py-4 px-6 rounded-xl font-bold text-lg w-full inline-flex items-center justify-center gap-2 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Crear una cuenta
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
                
                <Link 
                  to="/login" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 py-4 px-6 rounded-xl font-bold text-lg w-full inline-flex items-center justify-center gap-2 transition-all duration-300"
                >
                  Ya tengo cuenta
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Newsletter Section */}
      <motion.section 
        className="container mx-auto px-4 mb-24"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-10 md:p-16">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-amber-500 font-medium mb-2 block">Mantente informado</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Suscríbete a nuestro boletín
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Recibe noticias, ofertas especiales y consejos para el cuidado de tus mascotas directamente en tu correo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className="flex-grow px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:border-amber-500 focus:outline-none"
              />
              <button 
                type="button"
                className="bg-amber-500 text-white hover:bg-amber-600 px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Suscribirme
              </button>
            </div>
            <p className="text-gray-500 mt-4 text-sm">
              Al suscribirte, aceptas recibir correos de marketing. Puedes darte de baja en cualquier momento.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 mb-16">
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 py-6">
          <div className="flex flex-col items-center">
            <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-gray-600 font-medium">Pago Seguro</span>
          </div>
          
          <div className="flex flex-col items-center">
            <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-gray-600 font-medium">Calidad Garantizada</span>
          </div>
          
          <div className="flex flex-col items-center">
            <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-gray-600 font-medium">Métodos de Pago</span>
          </div>
          
          <div className="flex flex-col items-center">
            <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-600 font-medium">Envío Rápido</span>
          </div>
          
          <div className="flex flex-col items-center">
            <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-gray-600 font-medium">Soporte 24/7</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
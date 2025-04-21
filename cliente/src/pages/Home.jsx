import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { getFullImageUrl } from '../utils/imageUtils';
import ProductCard from '../components/productos/ProductCard';

const Home = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [destacados, setDestacados] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const placeholderImage = '/placeholder-product.jpg';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Obtener productos destacados
        const resDestacados = await axios.get('/api/productos?destacado=true&limit=4');
        console.log("Datos de productos destacados:", resDestacados.data.data);
        setDestacados(resDestacados.data.data);

        const resOfertas = await axios.get('/api/productos?enOferta=true&limit=4');
        console.log("Datos de productos en oferta:", resOfertas.data.data);
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
      descripcion: 'La mejor nutrición para tu mascota'
    },
    {
      id: 'accesorios',
      nombre: 'Accesorios',
      imagen: 'src/img/accesorios.webp',
      descripcion: 'Todo lo que necesita tu amigo peludo'
    },
    {
      id: 'juguetes',
      nombre: 'Juguetes',
      imagen: 'src/img/juguetes.jpeg',
      descripcion: 'Diversión y entretenimiento para tus mascotas'
    },
    {
      id: 'higiene',
      nombre: 'Higiene y Cuidado',
      imagen: 'src/img/higiene.jpg',
      descripcion: 'Productos para mantener a tu mascota limpia y saludable'
    }
  ];

  const tiposMascotas = [
    { id: 'perro', nombre: 'Perros', imagen: 'src/img/perro.webp' },
    { id: 'gato', nombre: 'Gatos', imagen: 'src/img/gatos.avif' },
    { id: 'ave', nombre: 'Aves', imagen: 'src/img/aves.webp' },
    { id: 'pez', nombre: 'Peces', imagen: 'src/img/peces.jpg' },
    { id: 'roedor', nombre: 'Roedores', imagen: 'src/img/roedores.jpg' },
    { id: 'reptil', nombre: 'Reptiles', imagen: 'src/img/reptiles.jpg' }
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const CustomProductCard = ({ producto }) => {
    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(price);
    };

    const precioFinal = producto.enOferta 
      ? producto.precio * (1 - producto.descuento / 100) 
      : producto.precio;

    return (
      <Link
        to={`/productos/${producto._id}`}
        className="group bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      >
        <div className="relative h-48">
          <img
            src={getFullImageUrl(producto, placeholderImage)}
            alt={producto.nombre}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              console.error("Error al cargar la imagen:", producto._id);
              e.target.src = placeholderImage;
            }}
          />
          {producto.enOferta && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              {producto.descuento}% OFF
            </div>
          )}
          {producto.destacado && !producto.enOferta && (
            <div className="absolute top-3 right-3 bg-[#FFD15C] text-white px-3 py-1 rounded-full text-sm font-bold">
              Destacado
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-[#FFD15C] transition-colors duration-200">
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
          <div className="flex items-baseline gap-2">
            {producto.enOferta ? (
              <>
                <span className="text-gray-400 line-through text-sm">
                  {formatPrice(producto.precio)}
                </span>
                <span className="text-xl font-bold text-[#FFD15C]">
                  {formatPrice(precioFinal)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-[#FFD15C]">
                {formatPrice(producto.precio)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-gray-50">
      <motion.section 
        className="relative min-h-[600px] bg-gradient-to-r from-[#FFD15C] to-[#FFA51C] text-gray-800 py-20 mb-12 rounded-2xl overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 relative z-10 flex items-center">
          <div className="max-w-2xl">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6 text-white"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Todo para tus mascotas en un solo lugar
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-white/90"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              Encuentra todo lo que necesitan tus amigos peludos con los mejores precios y calidad garantizada
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link 
                to="/productos" 
                className="bg-white text-[#FFD15C] hover:bg-gray-100 py-4 px-8 rounded-full font-bold text-center text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Explorar Productos
              </Link>
              <Link 
                to="/productos?enOferta=true" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 py-4 px-8 rounded-full font-bold text-center text-lg transition-all duration-300"
              >
                Ver Ofertas
              </Link>
            </motion.div>
          </div>
          <motion.div 
            className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 mr-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <img 
              src="/src/img/happy.webp" 
              alt="Mascota feliz" 
              className="w-[500px] h-auto object-contain"
            />
          </motion.div>
        </div>

        <div className="absolute left-0 bottom-0 opacity-10">
          <svg className="w-64 h-64" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M140.5,59.5c14.3,5.4,30.2,10.8,38,22.1c7.8,11.3,7.5,28.3,1.1,41.9c-6.4,13.6-19,23.8-33.2,28.9c-14.2,5.1-30,5.1-45.9,0.7c-15.9-4.4-31.9-13.2-40.3-27.6c-8.4-14.3-9.3-34.3-1.4-47.8c7.9-13.5,24.5-20.6,40.2-26.1c15.6-5.5,30.2-9.5,44.5-4.1C143.5,47.4,126.2,54.1,140.5,59.5z" />
          </svg>
        </div>
      </motion.section>

      <motion.section 
        className="container mx-auto px-4 mb-20"
        {...fadeIn}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Categorías Populares
          </h2>
          <Link 
            to="/productos" 
            className="text-[#FFD15C] hover:text-[#FFA51C] font-semibold flex items-center gap-2 group"
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
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categorias.map((categoria, index) => (
            <motion.div
              key={categoria.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={`/productos?categoria=${categoria.id}`}
                className="group block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={categoria.imagen} 
                    alt={categoria.nombre}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                    onError={(e) => {
                      console.error("Error al cargar la imagen de categoría:", categoria.id);
                      e.target.src = placeholderImage;
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-[#FFD15C] transition-colors">
                    {categoria.nombre}
                  </h3>
                  <p className="text-gray-600">
                    {categoria.descripcion}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Tienda por Tipo de Mascota</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {tiposMascotas.map((tipo) => (
            <Link 
              key={tipo.id} 
              to={`/productos?tipoMascota=${tipo.id}`}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center hover:shadow-lg transition-shadow text-center"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 mb-3 overflow-hidden">
                <img 
                  src={tipo.imagen} 
                  alt={tipo.nombre}
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    console.error("Error al cargar la imagen de tipo de mascota:", tipo.id);
                    e.target.src = placeholderImage;
                  }}
                />
              </div>
              <h3 className="font-medium">{tipo.nombre}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Productos Destacados</h2>
          <Link to="/productos?destacado=true" className="text-[#FFD15C] hover:underline font-medium">
            Ver más
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD15C]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destacados.map((producto) => (
              <CustomProductCard key={producto._id} producto={producto} />
            ))}
            
            {destacados.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No hay productos destacados disponibles en este momento.
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Ofertas Especiales</h2>
          <Link to="/productos?enOferta=true" className="text-[#FFD15C] hover:underline font-medium">
            Ver más
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD15C]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ofertas.map((producto) => (
              <CustomProductCard key={producto._id} producto={producto} />
            ))}
            
            {ofertas.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No hay ofertas disponibles en este momento.
              </div>
            )}
          </div>
        )}
      </section>
      {currentUser ? (
        <motion.section 
          className="bg-gradient-to-r from-[#FFD15C] to-[#FFA51C] text-white rounded-2xl p-8 mb-16 overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                ¡Bienvenido de nuevo, {currentUser.nombre}!
              </h2>
              <p className="text-white/90">
                Explora nuestras nuevas ofertas y productos destacados.
              </p>
            </div>
            <Link 
              to="/productos" 
              className="bg-white text-[#FFD15C] hover:bg-gray-50 py-3 px-6 rounded-xl font-bold text-center inline-flex items-center gap-2 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Explorar Productos
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          {/* Elementos decorativos */}
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
            <svg className="w-64 h-64" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M140.5,59.5c14.3,5.4,30.2,10.8,38,22.1c7.8,11.3,7.5,28.3,1.1,41.9c-6.4,13.6-19,23.8-33.2,28.9c-14.2,5.1-30,5.1-45.9,0.7c-15.9-4.4-31.9-13.2-40.3-27.6c-8.4-14.3-9.3-34.3-1.4-47.8c7.9-13.5,24.5-20.6,40.2-26.1c15.6-5.5,30.2-9.5,44.5-4.1C143.5,47.4,126.2,54.1,140.5,59.5z" />
            </svg>
          </div>
        </motion.section>
      ) : (
        <motion.section 
          className="bg-gradient-to-r from-[#FFD15C] to-[#FFA51C] text-white rounded-2xl p-8 mb-16 overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                ¡Únete a nuestro programa de fidelidad!
              </h2>
              <p className="text-white/90">
                Obtén descuentos exclusivos y acumula puntos en cada compra.
              </p>
            </div>
            <Link 
              to="/register" 
              className="bg-white text-[#FFD15C] hover:bg-gray-50 py-3 px-6 rounded-xl font-bold text-center inline-flex items-center gap-2 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Regístrate Ahora
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          {/* Elementos decorativos */}
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
            <svg className="w-64 h-64" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M140.5,59.5c14.3,5.4,30.2,10.8,38,22.1c7.8,11.3,7.5,28.3,1.1,41.9c-6.4,13.6-19,23.8-33.2,28.9c-14.2,5.1-30,5.1-45.9,0.7c-15.9-4.4-31.9-13.2-40.3-27.6c-8.4-14.3-9.3-34.3-1.4-47.8c7.9-13.5,24.5-20.6,40.2-26.1c15.6-5.5,30.2-9.5,44.5-4.1C143.5,47.4,126.2,54.1,140.5,59.5z" />
            </svg>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default Home;
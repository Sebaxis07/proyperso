import { useContext, useState, useEffect } from 'react';
import { FaPaw, FaHeart, FaMedal, FaHandHoldingHeart, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Nosotros = () => {
  const { currentUser } = useContext(AuthContext);
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [formData, setFormData] = useState({
    texto: '',
    calificacion: 5
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchTestimonios = async () => {
      try {
        setLoading(true);
        
        // No es necesario enviar token para obtener testimonios (ruta pública)
        const response = await axios.get('/api/testimonios');
        
        if (response.data && Array.isArray(response.data)) {
          setTestimonios(response.data);
        } else {
          console.error('Formato de respuesta inesperado:', response.data);
          setError('Error al cargar testimonios: formato de datos inesperado');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar testimonios:', err);
        setError('Error al cargar testimonios. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };

    fetchTestimonios();
  }, []);

  // Función handleSubmit modificada para no requerir token
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.texto.trim().length < 10) {
      setError('Por favor, escribe un testimonio más detallado (mínimo 10 caracteres).');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos del testimonio
      const testimonioData = {
        texto: formData.texto,
        calificacion: formData.calificacion
      };
      
      // Si hay usuario autenticado, incluir información adicional
      if (currentUser) {
        testimonioData.usuarioId = currentUser.id || currentUser._id;
        testimonioData.nombre = currentUser.nombre;
      }
      
      // Configuración para la solicitud
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      // Intentar agregar token si existe (opcional)
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Enviar el testimonio (ahora funciona sin token)
      const response = await axios.post('/api/testimonios', testimonioData, config);
      
      if (response.data && response.data.success) {
        // Obtener la lista actualizada de testimonios
        const updatedTestimonios = await axios.get('/api/testimonios');
        
        if (updatedTestimonios.data && Array.isArray(updatedTestimonios.data)) {
          setTestimonios(updatedTestimonios.data);
        }
        
        // Limpiar el formulario y mostrar mensaje de éxito
        setFormData({ texto: '', calificacion: 5 });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(response.data?.message || 'Error al enviar el testimonio. Inténtalo de nuevo.');
      }
      
    } catch (err) {
      console.error('Error al enviar testimonio:', err);
      
      if (err.response) {
        // Error de respuesta del servidor
        setError(err.response.data?.message || 'Error al enviar tu testimonio. Por favor, intenta nuevamente.');
      } else if (err.request) {
        // Error de conexión
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        // Otro tipo de error
        setError('Error al enviar tu testimonio. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative h-[85vh] bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[#FFD15C]/10">
          <div className="absolute inset-0 bg-[url('/src/assets/pattern-light.png')] opacity-30"></div>
        </div>
        
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FFD15C]/5 -skew-x-12 transform origin-top"></div>
        <div className="absolute top-0 right-0 w-1/4 h-full bg-[#FFD15C]/10 -skew-x-12 transform origin-top"></div>
        
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="max-w-xl"
            >
              <span className="inline-block px-4 py-2 bg-[#FFD15C]/10 text-[#FFD15C] rounded-full text-sm font-medium mb-6">
                Bienvenidos a Lucky Pet Shop
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                El mejor cuidado para tus 
                <span className="text-[#FFD15C] block">mejores amigos</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Desde 2018 nos dedicamos a brindar productos premium y servicios 
                especializados para el bienestar de tus mascotas.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-[#FFD15C] text-white rounded-lg hover:shadow-lg 
                           transition-all duration-300 font-medium flex items-center gap-2"
                >
                  Conoce nuestra historia
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.button>
                <motion.button
                
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-lg
                           hover:border-[#FFD15C] hover:text-[#FFD15C] transition-all duration-300 font-medium"
                >
                  Ver productos
                </motion.button>
              </div>

              <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-100">
                <div>
                  <span className="block text-3xl font-bold text-[#FFD15C]">15k+</span>
                  <span className="text-gray-600">Mascotas felices</span>
                </div>
                <div>
                  <span className="block text-3xl font-bold text-[#FFD15C]">98%</span>
                  <span className="text-gray-600">Clientes satisfechos</span>
                </div>
                <div>
                  <span className="block text-3xl font-bold text-[#FFD15C]">24/7</span>
                  <span className="text-gray-600">Soporte premium</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-[600px] rounded-2xl overflow-hidden">
                <img 
                  src="/src/assets/happydog.png"
                  alt="Mascota feliz"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md 
                           rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FFD15C]/20 rounded-full flex items-center justify-center">
                      <FaPaw className="text-[#FFD15C] text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Atención Personalizada</h3>
                      <p className="text-sm text-gray-600">Expertos disponibles para tu mascota</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:w-1/2"
            >
              <span className="text-sm font-bold tracking-wider text-[#FFD15C] uppercase mb-4 block">
                Nuestra Historia
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                Una trayectoria de 
                <span className="text-[#3498DB]"> excelencia </span>
                en el cuidado animal
              </h2>
              <div className="prose prose-lg text-gray-600">
                <p>
                  Fundada por expertos veterinarios con más de 15 años de experiencia,
                  Lucky Pet Shop nació con una visión clara: revolucionar la manera en
                  que cuidamos a nuestras mascotas.
                </p>
                <div className="grid grid-cols-2 gap-8 my-12">
                  <div className="border-l-4 border-[#FFD15C] pl-4">
                    <span className="block text-3xl font-bold text-[#3498DB]">32+</span>
                    <span className="text-gray-600">Profesionales dedicados</span>
                  </div>
                  <div className="border-l-4 border-[#FFD15C] pl-4">
                    <span className="block text-3xl font-bold text-[#3498DB]">24</span>
                    <span className="text-gray-600">Proveedores certificados</span>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="md:w-1/2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute inset-0 bg-[#FFD15C] rounded-3xl blur-3xl opacity-20 transform rotate-6"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 overflow-hidden">
                  <img 
                    src=".././src/assets/logo.png" 
                    alt="Lucky Pet Shop Logo" 
                    className="w-48 h-48 mx-auto mb-8 transform hover:scale-105 transition-transform"
                  />
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <Achievement number="15k+" text="Mascotas felices" />
                    <Achievement number="98%" text="Clientes satisfechos" />
                    <Achievement number="5⭐" text="Calificación" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path/to/pattern.png')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Nuestros Valores</h2>
            <div className="w-20 h-1 bg-[#FFD15C] mx-auto"></div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ValorCard 
              icon={<FaPaw className="text-4xl text-[#FFD15C]" />}
              title="Compromiso"
              description="Nos dedicamos al 100% al bienestar de cada mascota que atendemos, adaptando nuestras recomendaciones a sus necesidades específicas."
            />
            <ValorCard 
              icon={<FaHeart className="text-4xl text-[#FFD15C]" />}
              title="Amor por los Animales"
              description="Todo nuestro equipo comparte una genuina pasión por los animales. Cada decisión que tomamos está centrada en su bienestar."
            />
            <ValorCard 
              icon={<FaMedal className="text-4xl text-[#FFD15C]" />}
              title="Calidad Certificada"
              description="Todos nuestros productos están certificados y cumplen con estándares internacionales de calidad y seguridad animal."
            />
            <ValorCard 
              icon={<FaHandHoldingHeart className="text-4xl text-[#FFD15C]" />}
              title="Atención Personalizada"
              description="Ofrecemos asesoramiento experto para cada cliente, entendiendo las necesidades únicas de su mascota."
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Lucky Pet Shop en Números</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number={3850} text="Clientes Registrados" />
            <StatCard number={7200} text="Mascotas Atendidas" />
            <StatCard number={1240} text="Productos en Catálogo" />
            <StatCard number={7} text="Años de Experiencia" />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Lo Que Dicen Nuestros Clientes</h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Opiniones reales de clientes que confían en nosotros para el cuidado de sus mascotas.
          </p>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD15C]"></div>
            </div>
          ) : testimonios.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              <motion.div 
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonios[activeTestimonial].imagen || '/images/default-avatar.jpg'} 
                    alt={testimonios[activeTestimonial].nombre}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-avatar.jpg';
                    }}
                  />
                  <div>
                    <h3 className="font-bold text-lg">{testimonios[activeTestimonial].nombre}</h3>
                    <p className="text-gray-600">{testimonios[activeTestimonial].cargo || 'Cliente'}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={`w-4 h-4 ${i < testimonios[activeTestimonial].calificacion ? 'text-[#FFD15C]' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(testimonios[activeTestimonial].fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 italic">{testimonios[activeTestimonial].texto}</p>
              </motion.div>
              <div className="flex justify-center mt-8 space-x-2">
                {testimonios.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === activeTestimonial ? 'bg-[#FFD15C]' : 'bg-gray-300'
                    }`}
                    aria-label={`Ver testimonio ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600">
              Aún no hay testimonios disponibles.
            </p>
          )}
          
          {currentUser && (
            <div className="max-w-3xl mx-auto mt-16 bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6">Comparte tu Experiencia</h3>
              
              {success ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>¡Gracias por compartir tu opinión! Tu testimonio ha sido publicado.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {error}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="calificacion" className="block text-sm font-medium text-gray-700 mb-1">
                      Tu Calificación
                    </label>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, calificacion: star }))}
                          className="focus:outline-none mr-1"
                        >
                          <FaStar 
                            className={`w-8 h-8 ${star <= formData.calificacion ? 'text-[#FFD15C]' : 'text-gray-300'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="texto" className="block text-sm font-medium text-gray-700 mb-1">
                      Tu Opinión
                    </label>
                    <textarea
                      id="texto"
                      name="texto"
                      value={formData.texto}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFD15C] focus:border-[#FFD15C]"
                      placeholder="Comparte tu experiencia con Lucky Pet Shop"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-[#FFD15C] text-white rounded-full hover:bg-[#FFC132] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD15C] disabled:opacity-50"
                    >
                      {loading ? 'Enviando...' : 'Publicar Testimonio'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestras Certificaciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <CertificacionCard 
              title="ISO 9001"
              description="Certificación internacional de calidad en nuestros procesos y servicios."
              year="2020"
            />
            <CertificacionCard 
              title="Pet Friendly Workplace"
              description="Reconocimiento a nuestro ambiente laboral que integra el bienestar animal."
              year="2021"
            />
            <CertificacionCard 
              title="Calidad Premium Animal"
              description="Acreditación que garantiza la excelencia en nuestros productos y servicios para mascotas."
              year="2019"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#FFF8E7]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Únete a Nuestra Comunidad</h2>
          <p className="text-gray-700 mb-8 max-w-3xl mx-auto">
            Descubre por qué miles de dueños de mascotas confían en Lucky Pet Shop para el cuidado de sus compañeros. Visítanos hoy y transforma la vida de tu mascota.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/productos" 
              className="px-8 py-3 bg-[#FFD15C] text-white rounded-full hover:bg-[#FFC132] transition-colors font-medium"
            >
              Explorar Productos
            </a>
            <a 
              href="/contacto" 
              className="px-8 py-3 border-2 border-[#FFD15C] text-[#FFD15C] rounded-full hover:bg-[#FFF8E7] transition-colors font-medium"
            >
              Contactar al Equipo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

const ValorCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3 }}
    className="bg-white p-8 rounded-2xl shadow-lg text-center group hover:shadow-2xl transition-all duration-300"
  >
    <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
      <div className="w-16 h-16 mx-auto bg-[#FFF8E7] rounded-full flex items-center justify-center">
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const StatCard = ({ number, text }) => (
  <div className="text-center">
    <span className="block text-4xl font-bold text-[#FFD15C] mb-2">
      {number.toLocaleString()}+
    </span>
    <span className="text-gray-700">{text}</span>
  </div>
);

const CertificacionCard = ({ title, description, year }) => (
  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
    <div className="inline-block bg-[#FFF8E7] px-3 py-1 rounded-full text-[#FFD15C] text-sm font-medium mb-4">
      Desde {year}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Achievement = ({ number, text }) => (
  <div className="p-4 rounded-xl bg-gray-50">
    <span className="block text-2xl font-bold text-[#3498DB] mb-1">{number}</span>
    <span className="text-sm text-gray-600">{text}</span>
  </div>
);

export default Nosotros;
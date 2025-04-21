import { useState, useCallback } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1.5rem' 
};

const center = {
  lat: -23.5737, 
  lng: -70.3850
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  scrollwheel: false, 
};

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showInfoWindow, setShowInfoWindow] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!formData.nombre || !formData.email || !formData.mensaje) {
        throw new Error('Por favor completa todos los campos obligatorios.');
      }
      
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        throw new Error('Por favor ingresa un correo electrónico válido.');
      }
      
      await axios.post('/api/contacto', formData);
      
      setSuccess(true);
      
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: ''
      });
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Ocurrió un error. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const onMapLoad = useCallback((map) => {
    console.log("Mapa cargado correctamente");
  }, []);

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="bg-gradient-to-r from-[#FFD15C] to-[#FFC132] py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            className="text-5xl font-bold text-white mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Contáctanos
          </motion.h1>
          <motion.p
            className="text-xl text-white/90 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Estamos aquí para responder tus preguntas y ayudarte con todo lo que necesites para el cuidado de tu mascota.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <ContactCard 
              icon={<FaPhone className="text-2xl text-[#FFD15C]" />}
              title="Llámanos"
              details={[
                { label: 'Tienda Principal', value: '(+56) 9 6340 8038' },
                { label: 'Servicio al Cliente', value: '(+56) 9 6340 8039' }
              ]}
            />
            <ContactCard 
              icon={<FaEnvelope className="text-2xl text-[#FFD15C]" />}
              title="Escríbenos"
              details={[
                { label: 'Información General', value: 'info@luckypetshop.com' },
                { label: 'Atención al Cliente', value: 'soporte@luckypetshop.com' }
              ]}
            />
            <ContactCard 
              icon={<FaMapMarkerAlt className="text-2xl text-[#FFD15C]" />}
              title="Visítanos"
              details={[
                { label: 'Dirección', value: 'Av. Edmundo Pérez Zujovic 11092, Antofagasta, Chile' },
                { label: 'Código Postal', value: '1271843' }
              ]}
            />
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-6">Nuestra Ubicación</h2>
              <div className="bg-white p-2 rounded-2xl shadow-lg h-[400px] mb-6 overflow-hidden">
                <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={15}
                    options={options}
                    onLoad={onMapLoad}
                  >
                    <Marker 
                      position={center}
                      onClick={() => setShowInfoWindow(true)}
                    >
                      {showInfoWindow && (
                        <InfoWindow
                          position={center}
                          onCloseClick={() => setShowInfoWindow(false)}
                        >
                          <div className="p-3">
                            <h3 className="font-bold text-gray-900">Lucky Pet Shop</h3>
                            <p className="text-gray-700">Av. Edmundo Pérez Zujovic 11092</p>
                            <p className="text-gray-700">Antofagasta, Chile</p>
                            <p className="text-gray-700">Tel: (+56) 9 6340 8038</p>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  </GoogleMap>
                </LoadScript>
              </div>
              
              <motion.div 
                className="bg-white p-6 rounded-2xl shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FaClock className="mr-2 text-[#FFD15C]" /> Horario de Atención
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="font-medium text-gray-700">Lunes a Viernes</span>
                    <span className="text-gray-600">09:00 - 20:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium text-gray-700">Sábados</span>
                    <span className="text-gray-600">10:00 - 18:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium text-gray-700">Domingos</span>
                    <span className="text-gray-600">11:00 - 15:00</span>
                  </li>
                </ul>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <a 
                    href="https://wa.me/56963408038" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-green-600 font-medium hover:text-green-700 transition-colors"
                  >
                    <FaWhatsapp className="mr-2 text-xl" /> 
                    Contáctanos por WhatsApp
                  </a>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-6">Envíanos un Mensaje</h2>
              
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border-l-4 border-green-500 p-6 rounded-2xl mb-6"
                >
                  <h3 className="text-xl font-medium text-green-800 mb-2">¡Mensaje enviado con éxito!</h3>
                  <p className="text-green-700">
                    Gracias por contactarnos. Nuestro equipo revisará tu mensaje y te responderá a la brevedad.
                  </p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="mt-4 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Enviar otro mensaje
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-[#FFD15C] transition"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-[#FFD15C] transition"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-[#FFD15C] transition"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-2">
                        Asunto
                      </label>
                      <select
                        id="asunto"
                        name="asunto"
                        value={formData.asunto}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-[#FFD15C] transition"
                      >
                        <option value="">Seleccionar asunto</option>
                        <option value="Información de productos">Información de productos</option>
                        <option value="Consulta veterinaria">Consulta veterinaria</option>
                        <option value="Seguimiento de pedido">Seguimiento de pedido</option>
                        <option value="Sugerencia">Sugerencia</option>
                        <option value="Reclamo">Reclamo</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-[#FFD15C] transition"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center mb-6">
                    <input
                      type="checkbox"
                      id="privacidad"
                      className="h-5 w-5 text-[#FFD15C] focus:ring-[#FFD15C] border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="privacidad" className="ml-3 block text-sm text-gray-700">
                      Acepto la <a href="/privacidad" className="text-[#FFD15C] hover:underline">política de privacidad</a> <span className="text-red-500">*</span>
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-5 bg-[#FFD15C] hover:bg-[#FFC132] text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD15C] disabled:opacity-50"
                  >
                    {loading ? 'Enviando...' : 'Enviar Mensaje'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Preguntas Frecuentes
          </motion.h2>
          
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <FAQ 
              question="¿Realizan envíos a domicilio?" 
              answer="Sí, realizamos envíos a todo el país. Los pedidos superiores a $30.000 tienen envío gratuito. Los tiempos de entrega varían entre 24-48 horas para zonas urbanas y 3-5 días para zonas rurales."
            />
            <FAQ 
              question="¿Ofrecen consultas veterinarias?" 
              answer="Sí, contamos con veterinarios en nuestra tienda principal que pueden realizar consultas básicas gratuitas. Para servicios más especializados, trabajamos con clínicas veterinarias asociadas donde nuestros clientes reciben descuentos especiales."
            />
            <FAQ 
              question="¿Tienen programa de fidelización?" 
              answer="Sí, nuestro programa 'Lucky Friends' ofrece puntos por cada compra que se pueden canjear por descuentos. Además, los miembros reciben ofertas exclusivas y acceso prioritario a nuevos productos."
            />
            <FAQ 
              question="¿Puedo cambiar un producto que no le gustó a mi mascota?" 
              answer="Por supuesto, ofrecemos un periodo de 15 días para cambios en productos que no hayan satisfecho a tu mascota. Solo necesitamos el comprobante de compra y que el producto esté en buen estado."
            />
            <FAQ 
              question="¿Ofrecen servicios de peluquería para mascotas?" 
              answer="Sí, en nuestra tienda principal contamos con un servicio de peluquería y spa para perros y gatos. Puedes solicitar una cita por teléfono o a través de nuestra web en la sección de servicios."
            />
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

const ContactCard = ({ icon, title, details }) => (
  <motion.div 
    whileHover={{ scale: 1.05, y: -5 }}
    transition={{ duration: 0.3 }}
    className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center"
  >
    <div className="w-16 h-16 bg-[#FFF8E7] rounded-full flex items-center justify-center mb-5">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-5 text-gray-800">{title}</h3>
    <ul className="space-y-3 w-full">
      {details.map((detail, index) => (
        <li key={index} className="border-t border-gray-100 pt-3 mt-3 first:border-0 first:pt-0 first:mt-0">
          <span className="block text-sm text-gray-500">{detail.label}</span>
          <span className="font-medium text-gray-700">{detail.value}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

const FAQ = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200 py-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left"
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        <span className={`ml-6 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="h-5 w-5 text-[#FFD15C]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mt-3"
        >
          <p className="text-gray-600">{answer}</p>
        </motion.div>
      )}
    </div>
  );
};

export default Contacto;
// cliente/src/pages/Profile.jsx
import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import InfoCard, { UserIcon, EmailIcon, PhoneIcon, IdIcon } from '../components/InfoCard';
import axios from 'axios'; // Añadir este import

const Profile = () => {
  const { currentUser, updateProfile, error } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [pedidosCount, setPedidosCount] = useState(0);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: {
      calle: '',
      numero: '',
      comuna: '',
      ciudad: '',
      region: '',
      codigoPostal: ''
    }
  });

  // Cargar datos del usuario cuando esté disponible
  useEffect(() => {
    if (currentUser) {
      setFormData({
        nombre: currentUser.nombre || '',
        apellido: currentUser.apellido || '',
        telefono: currentUser.telefono || '',
        direccion: {
          calle: currentUser.direccion?.calle || '',
          numero: currentUser.direccion?.numero || '',
          comuna: currentUser.direccion?.comuna || '',
          ciudad: currentUser.direccion?.ciudad || '',
          region: currentUser.direccion?.region || '',
          codigoPostal: currentUser.direccion?.codigoPostal || ''
        }
      });
    }
  }, [currentUser]);

  // Añadir efecto para obtener el conteo de pedidos
  useEffect(() => {
    const fetchPedidosCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/pedidos/count', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setPedidosCount(response.data.count);
      } catch (error) {
        console.error('Error al obtener conteo de pedidos:', error);
      }
    };

    if (currentUser) {
      fetchPedidosCount();
    }
  }, [currentUser]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Manejar cambios en campos anidados (dirección)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      // Manejar cambios en campos normales
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Validar el formulario
  const validateForm = () => {
    const errors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }

    // Validar apellido
    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio';
    }

    // Validar campos obligatorios de dirección
    if (!formData.direccion.calle.trim()) {
      errors['direccion.calle'] = 'La calle es obligatoria';
    }
    if (!formData.direccion.numero.trim()) {
      errors['direccion.numero'] = 'El número es obligatorio';
    }
    if (!formData.direccion.comuna.trim()) {
      errors['direccion.comuna'] = 'La comuna es obligatoria';
    }
    if (!formData.direccion.ciudad.trim()) {
      errors['direccion.ciudad'] = 'La ciudad es obligatoria';
    }
    if (!formData.direccion.region.trim()) {
      errors['direccion.region'] = 'La región es obligatoria';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await updateProfile(formData);
        setIsEditing(false);
      } catch (err) {
        // El error ya se maneja en el contexto
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Modificar la sección del Resumen de Cuenta
  const ResumenCuenta = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-8 transform hover:scale-[1.02] transition-all duration-300">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Resumen de Cuenta</h3>
      
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Pedidos realizados</span>
            <span className="text-2xl font-bold text-[#FFD15C]">{pedidosCount}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#FFD15C] transition-all duration-1000"
              style={{ width: `${Math.min((pedidosCount / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <Link
          to="/pedidos"
          className="block text-center py-3 px-6 bg-[#FFD15C] text-white rounded-xl hover:bg-[#FFC132] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
        >
          Ver historial de pedidos
        </Link>
      </div>
    </div>
  );

  // Modificar la sección de Dirección para permitir edición independiente
  const DireccionSection = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="w-12 h-12 bg-[#FFD15C]/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            Dirección de Envío
          </h2>
          <button
            onClick={() => setIsEditing(true)}
            className="text-[#FFD15C] hover:text-[#FFC132] transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        {currentUser?.direccion?.calle ? (
          <div className="bg-gray-50 rounded-2xl p-6 animate-fadeIn">
            <p className="text-xl font-medium text-gray-900 mb-2">
              {currentUser.direccion.calle} {currentUser.direccion.numero}
            </p>
            <p className="text-gray-600">
              {currentUser.direccion.comuna}, {currentUser.direccion.ciudad}
            </p>
            <p className="text-gray-600">
              {currentUser.direccion.region}
              {currentUser.direccion.codigoPostal && 
                <span className="ml-2 text-gray-500">CP: {currentUser.direccion.codigoPostal}</span>
              }
            </p>
          </div>
        ) : (
          <div className="text-center py-12 animate-fadeIn">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 mb-4">No has añadido una dirección todavía</p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-[#FFD15C] hover:text-[#FFC132] font-medium"
            >
              Agregar dirección
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con animación */}
        <div className="relative mb-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mi Perfil
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-[#FFD15C] rounded-full"></div>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Gestiona tu información personal y preferencias de envío
          </p>
        </div>

        {/* Botones de Acción Flotantes */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
          <Link
            to="/pedidos"
            className="group bg-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <svg className="w-6 h-6 text-[#FFD15C] group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </Link>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="group bg-[#FFD15C] p-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <svg className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>

        {/* Tarjetas de Información */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Panel Principal */}
          <div className="lg:col-span-8 space-y-8">
            {/* Información Personal */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="w-12 h-12 bg-[#FFD15C]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    Información Personal
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[#FFD15C] hover:text-[#FFC132] transition-colors duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  // Formulario
                  <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Nombre */}
                      <div>
                        <label htmlFor="nombre" className="form-label">Nombre</label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          className={`form-input ${formErrors.nombre ? 'border-red-500' : ''}`}
                        />
                        {formErrors.nombre && <p className="form-error">{formErrors.nombre}</p>}
                      </div>

                      {/* Apellido */}
                      <div>
                        <label htmlFor="apellido" className="form-label">Apellido</label>
                        <input
                          type="text"
                          id="apellido"
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleChange}
                          className={`form-input ${formErrors.apellido ? 'border-red-500' : ''}`}
                        />
                        {formErrors.apellido && <p className="form-error">{formErrors.apellido}</p>}
                      </div>
                    </div>

                    <div className="mb-4">
                      {/* Teléfono */}
                      <div>
                        <label htmlFor="telefono" className="form-label">Teléfono</label>
                        <input
                          type="tel"
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-4 mt-6">Dirección</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Calle */}
                      <div>
                        <label htmlFor="direccion.calle" className="form-label">Calle</label>
                        <input
                          type="text"
                          id="direccion.calle"
                          name="direccion.calle"
                          value={formData.direccion.calle}
                          onChange={handleChange}
                          className={`form-input ${formErrors['direccion.calle'] ? 'border-red-500' : ''}`}
                        />
                        {formErrors['direccion.calle'] && <p className="form-error">{formErrors['direccion.calle']}</p>}
                      </div>

                      {/* Número */}
                      <div>
                        <label htmlFor="direccion.numero" className="form-label">Número</label>
                        <input
                          type="text"
                          id="direccion.numero"
                          name="direccion.numero"
                          value={formData.direccion.numero}
                          onChange={handleChange}
                          className={`form-input ${formErrors['direccion.numero'] ? 'border-red-500' : ''}`}
                        />
                        {formErrors['direccion.numero'] && <p className="form-error">{formErrors['direccion.numero']}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Comuna */}
                      <div>
                        <label htmlFor="direccion.comuna" className="form-label">Comuna</label>
                        <input
                          type="text"
                          id="direccion.comuna"
                          name="direccion.comuna"
                          value={formData.direccion.comuna}
                          onChange={handleChange}
                          className={`form-input ${formErrors['direccion.comuna'] ? 'border-red-500' : ''}`}
                        />
                        {formErrors['direccion.comuna'] && <p className="form-error">{formErrors['direccion.comuna']}</p>}
                      </div>

                      {/* Ciudad */}
                      <div>
                        <label htmlFor="direccion.ciudad" className="form-label">Ciudad</label>
                        <input
                          type="text"
                          id="direccion.ciudad"
                          name="direccion.ciudad"
                          value={formData.direccion.ciudad}
                          onChange={handleChange}
                          className={`form-input ${formErrors['direccion.ciudad'] ? 'border-red-500' : ''}`}
                        />
                        {formErrors['direccion.ciudad'] && <p className="form-error">{formErrors['direccion.ciudad']}</p>}
                      </div>

                      {/* Región */}
                      <div>
                        <label htmlFor="direccion.region" className="form-label">Región</label>
                        <input
                          type="text"
                          id="direccion.region"
                          name="direccion.region"
                          value={formData.direccion.region}
                          onChange={handleChange}
                          className={`form-input ${formErrors['direccion.region'] ? 'border-red-500' : ''}`}
                        />
                        {formErrors['direccion.region'] && <p className="form-error">{formErrors['direccion.region']}</p>}
                      </div>
                    </div>

                    <div className="mb-6">
                      {/* Código Postal */}
                      <div>
                        <label htmlFor="direccion.codigoPostal" className="form-label">Código Postal</label>
                        <input
                          type="text"
                          id="direccion.codigoPostal"
                          name="direccion.codigoPostal"
                          value={formData.direccion.codigoPostal}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Guardando...
                          </span>
                        ) : 'Guardar Cambios'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn btn-outline"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  // Vista de información
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    <InfoCard 
                      label="Nombre Completo"
                      value={`${currentUser?.nombre || ''} ${currentUser?.apellido || ''}`}
                      icon={<UserIcon />}
                    />
                    <InfoCard 
                      label="Email"
                      value={currentUser?.email}
                      icon={<EmailIcon />}
                    />
                    <InfoCard 
                      label="Teléfono"
                      value={currentUser?.telefono || 'No especificado'}
                      icon={<PhoneIcon />}
                    />
                    <InfoCard 
                      label="RUT"
                      value={currentUser?.rut || 'No especificado'}
                      icon={<IdIcon />}
                    />
                  </div>
                )}
              </div>
            </div>

            <DireccionSection />
          </div>

          {/* Panel Lateral */}
          <div className="lg:col-span-4 space-y-8">
            <ResumenCuenta />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
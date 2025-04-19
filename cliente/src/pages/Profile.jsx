// cliente/src/pages/Profile.jsx
import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { currentUser, updateProfile, error } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 relative">
          Mi Perfil
          <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-[#FFD15C] rounded-full transform origin-left transition-all duration-300 ease-out"></span>
        </h1>
        
        <div className="flex gap-4">
          <Link 
            to="/pedidos" 
            className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-200 rounded-full hover:border-[#FFD15C] hover:text-[#FFD15C] transition-all duration-300 flex items-center gap-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Mis Pedidos
          </Link>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 bg-[#FFD15C] text-white rounded-full hover:bg-[#FFC132] transition-all duration-300 flex items-center gap-2 group shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Editar Perfil
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg animate-fadeIn">
          <p className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        </div>
      )}
      
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
        {isEditing ? (
          // Formulario de edición
          <form onSubmit={handleSubmit} className="p-8">
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
          // Vista de solo lectura
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="transform transition-all duration-300 hover:scale-102">
                <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Información Personal
                </h3>
                <ul className="space-y-4">
                  <li className="grid grid-cols-3 items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <span className="text-gray-600 col-span-1 font-medium">Nombre:</span>
                    <span className="font-medium col-span-2 text-gray-800">{`${currentUser?.nombre || ''} ${currentUser?.apellido || ''}`}</span>
                  </li>
                  <li className="grid grid-cols-3 items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <span className="text-gray-600 col-span-1 font-medium">Email:</span>
                    <span className="font-medium col-span-2 text-gray-800">{currentUser?.email || ''}</span>
                  </li>
                  <li className="grid grid-cols-3 items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <span className="text-gray-600 col-span-1 font-medium">RUT:</span>
                    <span className="font-medium col-span-2 text-gray-800">{currentUser?.rut || ''}</span>
                  </li>
                  <li className="grid grid-cols-3 items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <span className="text-gray-600 col-span-1 font-medium">Teléfono:</span>
                    <span className="font-medium col-span-2 text-gray-800">{currentUser?.telefono || 'No especificado'}</span>
                  </li>
                </ul>
              </div>
              
              <div className="transform transition-all duration-300 hover:scale-102">
                <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Dirección de Envío
                </h3>
                {currentUser?.direccion?.calle ? (
                  <ul className="space-y-4">
                    <li className="grid grid-cols-3 items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <span className="text-gray-600 col-span-1 font-medium">Calle:</span>
                      <span className="font-medium col-span-2 text-gray-800">{`${currentUser?.direccion?.calle || ''} ${currentUser?.direccion?.numero || ''}`}</span>
                    </li>
                    <li className="grid grid-cols-3 items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <span className="text-gray-600 col-span-1 font-medium">Comuna:</span>
                      <span className="font-medium col-span-2 text-gray-800">{currentUser?.direccion?.comuna || ''}</span>
                    </li>
                    <li className="grid grid-cols-3 items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <span className="text-gray-600 col-span-1 font-medium">Ciudad:</span>
                      <span className="font-medium col-span-2 text-gray-800">{currentUser?.direccion?.ciudad || ''}</span>
                    </li>
                    <li className="grid grid-cols-3 items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <span className="text-gray-600 col-span-1 font-medium">Región:</span>
                      <span className="font-medium col-span-2 text-gray-800">{currentUser?.direccion?.region || ''}</span>
                    </li>
                    {currentUser?.direccion?.codigoPostal && (
                      <li className="grid grid-cols-3 items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <span className="text-gray-600 col-span-1 font-medium">Código Postal:</span>
                        <span className="font-medium col-span-2 text-gray-800">{currentUser?.direccion?.codigoPostal}</span>
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="text-gray-500 flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No has añadido una dirección todavía.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
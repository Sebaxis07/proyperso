import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, currentUser, error } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rut: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    direccion: {
      calle: '',
      numero: '',
      comuna: '',
      ciudad: '',
      region: '',
      codigoPostal: ''
    }
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const { 
    nombre, 
    apellido, 
    email, 
    rut, 
    telefono, 
    password, 
    confirmPassword, 
    direccion 
  } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!nombre.trim()) {
        errors.nombre = 'El nombre es obligatorio';
      }

      if (!apellido.trim()) {
        errors.apellido = 'El apellido es obligatorio';
      }

      if (!email) {
        errors.email = 'El email es obligatorio';
      } else if (!/^\S+@\S+\.\S+$/.test(email)) {
        errors.email = 'Email inválido';
      }
      if (!rut.trim()) {
        errors.rut = 'El RUT es obligatorio';
      } else if (!/^[0-9]{7,8}-[0-9kK]$/.test(rut.trim())) {
        errors.rut = 'Formato de RUT inválido (ej: 12345678-9)';
      }

      if (!password) {
        errors.password = 'La contraseña es obligatoria';
      } else if (password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (password !== confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else if (step === 2) {
      if (!direccion.calle.trim()) {
        errors['direccion.calle'] = 'La calle es obligatoria';
      }
      if (!direccion.numero.trim()) {
        errors['direccion.numero'] = 'El número es obligatorio';
      }
      if (!direccion.comuna.trim()) {
        errors['direccion.comuna'] = 'La comuna es obligatoria';
      }
      if (!direccion.ciudad.trim()) {
        errors['direccion.ciudad'] = 'La ciudad es obligatoria';
      }
      if (!direccion.region.trim()) {
        errors['direccion.region'] = 'La región es obligatoria';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateForm = () => {
    const personalInfoValid = validateStep(1);
    const addressValid = validateStep(2);
    return personalInfoValid && addressValid;
  };

  // Manejar el avance al siguiente paso
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        handleNextStep();
      } else {
        if (validateForm()) {
          setIsSubmitting(true);
          try {
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
          } catch (err) {
            setIsSubmitting(false);
          }
        }
      }
    }
  };

  const handleRutChange = (e) => {
    let value = e.target.value;
    
    value = value.replace(/[^0-9kK]/g, '');
    
    if (value.length > 1) {
      const dv = value.slice(-1);
      const rutBody = value.slice(0, -1);
      value = `${rutBody}-${dv}`;
    }
    
    setFormData({
      ...formData,
      rut: value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-3xl font-extrabold text-center text-gray-900 mt-2">
            Crear Cuenta
          </h1>
          <p className="mt-2 text-center text-gray-600">
            {currentStep === 1 ? "Información personal" : "Dirección de entrega"}
          </p>
          
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      index + 1 <= currentStep ? 'bg-[#FFB100]' : 'bg-gray-300'
                    } text-white font-medium text-lg transition-colors duration-300`}
                  >
                    {index + 1}
                  </div>
                  {index < totalSteps - 1 && (
                    <div className="w-full h-1 mx-2 sm:mx-4 bg-gray-200">
                      <div 
                        className={`h-full ${
                          index + 1 < currentStep ? 'bg-[#FFB100]' : 'bg-gray-200'
                        } transition-all duration-300`}
                        style={{ width: index + 1 < currentStep ? '100%' : '0%' }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs font-medium text-gray-500">Información personal</span>
              <span className="text-xs font-medium text-gray-500">Dirección de entrega</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={nombre}
                      onChange={handleChange}
                      autoComplete="given-name"
                      placeholder="Tu nombre"
                      className={`pl-10 pr-4 py-3 w-full text-gray-900 border ${
                        formErrors.nombre ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent rounded-xl shadow-sm`}
                    />
                  </div>
                  {formErrors.nombre && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      value={apellido}
                      onChange={handleChange}
                      autoComplete="family-name"
                      placeholder="Tu apellido"
                      className={`pl-10 pr-4 py-3 w-full text-gray-900 border ${
                        formErrors.apellido ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent rounded-xl shadow-sm`}
                    />
                  </div>
                  {formErrors.apellido && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.apellido}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      autoComplete="email"
                      placeholder="tu@email.com"
                      className={`pl-10 pr-4 py-3 w-full text-gray-900 border ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent rounded-xl shadow-sm`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1">
                    RUT
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="rut"
                      name="rut"
                      value={rut}
                      onChange={handleRutChange}
                      placeholder="12345678-9"
                      className={`pl-10 pr-4 py-3 w-full text-gray-900 border ${
                        formErrors.rut ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent rounded-xl shadow-sm`}
                    />
                  </div>
                  {formErrors.rut && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.rut}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono <span className="text-gray-500 text-xs">(opcional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={telefono}
                      onChange={handleChange}
                      placeholder="+56 9 1234 5678"
                      className="pl-10 pr-4 py-3 w-full text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent rounded-xl shadow-sm"
                    />
                  </div>
                </div>

                <div className="hidden md:block"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={password}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      className={`pl-10 pr-10 py-3 w-full text-gray-900 border ${
                        formErrors.password ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent rounded-xl shadow-sm`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirma tu contraseña"
                      className={`pl-10 pr-10 py-3 w-full text-gray-900 border ${
                        formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent rounded-xl shadow-sm`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Esta dirección será usada como predeterminada para tus envíos. Podrás añadir más direcciones después.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="direccion.calle" className="block text-sm font-medium text-gray-700 mb-1">
                    Calle
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="direccion.calle"
                      name="direccion.calle"
                      value={direccion.calle}
                      onChange={handleChange}
                      placeholder="Nombre de la calle"
                      className={`pl-10 pr-4 py-3 w-full text-gray-900 border ${
                        formErrors['direccion.calle'] ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent rounded-xl shadow-sm`}
                    />
                  </div>
                  {formErrors['direccion.calle'] && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors['direccion.calle']}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="direccion.numero" className="block text-sm font-medium text-gray-700 mb-1">
                    Número
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="direccion.numero"
                      name="direccion.numero"
                      value={direccion.numero}
                      onChange={handleChange}
                      placeholder="Número"
                      className={`pl-10 pr-4 py-3 w-full text-gray-900 border ${
                        formErrors['direccion.numero'] ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent rounded-xl shadow-sm`}
                    />
                  </div>
                  {formErrors['direccion.numero'] && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors['direccion.numero']}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="direccion.comuna" className="block text-sm font-medium text-gray-700 mb-1">
                    Comuna
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="direccion.comuna"
                      name="direccion.comuna"
                      value={direccion.comuna}
                      onChange={handleChange}
                      placeholder="Comuna"
                      className={`pl-10 pr-4 py-3 w-full text-gray-900 border ${
                        formErrors['direccion.comuna'] ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent rounded-xl shadow-sm`}
                    />
                  </div>
                  {formErrors['direccion.comuna'] && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors['direccion.comuna']}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="direccion.ciudad" className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="direccion.ciudad"
                      name="direccion.ciudad"
                      value={direccion.ciudad}
                      onChange={handleChange}
                      placeholder="Ciudad"
                      className={`pl-10 pr-4 py-3 w-full text-gray-900 border ${
                        formErrors['direccion.ciudad'] ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent rounded-xl shadow-sm`}
                    />
                  </div>
                  {formErrors['direccion.ciudad'] && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors['direccion.ciudad']}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="direccion.region" className="block text-sm font-medium text-gray-700 mb-1">
                    Región
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="direccion.region"
                      name="direccion.region"
                      value={direccion.region}
                      onChange={handleChange}
                      placeholder="Región"
                      className={`pl-10 pr-4 py-3 w-full text-gray-900 border ${
                        formErrors['direccion.region'] ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent rounded-xl shadow-sm`}
                    />
                  </div>
                  {formErrors['direccion.region'] && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors['direccion.region']}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="direccion.codigoPostal" className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal <span className="text-gray-500 text-xs">(opcional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="direccion.codigoPostal"
                    name="direccion.codigoPostal"
                    value={direccion.codigoPostal}
                    onChange={handleChange}
                    placeholder="Código Postal"
                    className="pl-10 pr-4 py-3 w-full text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent rounded-xl shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between space-x-3 pt-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD15C]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Atrás
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative flex-1 flex justify-center py-3 px-4 border border-transparent text-white text-lg font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB100] ${
                isSubmitting ? 'bg-[#FFD15C] cursor-not-allowed' : 'bg-[#FFB100] hover:bg-[#FF9500] transform transition-all hover:scale-[1.02]'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  {currentStep < totalSteps ? (
                    <>
                      Continuar
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Crear Cuenta
                    </>
                  )}
                </span>
              )}
            </button>
          </div>
          
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">o continúa con</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-medium text-[#FFB100] hover:text-[#FF9500] hover:underline transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
                      
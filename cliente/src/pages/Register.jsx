// cliente/src/pages/Register.jsx
import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, currentUser, error } = useContext(AuthContext);

  // Si el usuario ya está autenticado, redirigir a la página principal
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Estados para el formulario
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

  // Destructuring de formData
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
    if (!nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }

    // Validar apellido
    if (!apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio';
    }

    // Validar email
    if (!email) {
      errors.email = 'El email es obligatorio';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Email inválido';
    }

    // Validar RUT (básico)
    if (!rut.trim()) {
      errors.rut = 'El RUT es obligatorio';
    } else if (!/^[0-9]{7,8}-[0-9kK]$/.test(rut.trim())) {
      errors.rut = 'Formato de RUT inválido (ej: 12345678-9)';
    }

    // Validar contraseña
    if (!password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Confirmar contraseña
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar campos obligatorios de dirección
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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Eliminar confirmPassword antes de enviar
        const { confirmPassword, ...registerData } = formData;
        await register(registerData);
        // Si llega aquí, el registro fue exitoso y el contexto redirigirá
      } catch (err) {
        setIsSubmitting(false);
        // El error ya se maneja en el contexto
      }
    }
  };

  // Formatear RUT mientras se escribe
  const handleRutChange = (e) => {
    let value = e.target.value;
    
    // Eliminar todos los caracteres excepto números y K
    value = value.replace(/[^0-9kK]/g, '');
    
    // Formatear con guión si tiene suficientes caracteres
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Crear Cuenta</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="form-label">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={nombre}
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
              value={apellido}
              onChange={handleChange}
              className={`form-input ${formErrors.apellido ? 'border-red-500' : ''}`}
            />
            {formErrors.apellido && <p className="form-error">{formErrors.apellido}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              className={`form-input ${formErrors.email ? 'border-red-500' : ''}`}
            />
            {formErrors.email && <p className="form-error">{formErrors.email}</p>}
          </div>

          {/* RUT */}
          <div>
            <label htmlFor="rut" className="form-label">RUT</label>
            <input
              type="text"
              id="rut"
              name="rut"
              value={rut}
              onChange={handleRutChange}
              placeholder="12345678-9"
              className={`form-input ${formErrors.rut ? 'border-red-500' : ''}`}
            />
            {formErrors.rut && <p className="form-error">{formErrors.rut}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="form-label">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={telefono}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Código Postal */}
          <div>
            <label htmlFor="direccion.codigoPostal" className="form-label">Código Postal</label>
            <input
              type="text"
              id="direccion.codigoPostal"
              name="direccion.codigoPostal"
              value={direccion.codigoPostal}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Calle */}
          <div>
            <label htmlFor="direccion.calle" className="form-label">Calle</label>
            <input
              type="text"
              id="direccion.calle"
              name="direccion.calle"
              value={direccion.calle}
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
              value={direccion.numero}
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
              value={direccion.comuna}
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
              value={direccion.ciudad}
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
              value={direccion.region}
              onChange={handleChange}
              className={`form-input ${formErrors['direccion.region'] ? 'border-red-500' : ''}`}
            />
            {formErrors['direccion.region'] && <p className="form-error">{formErrors['direccion.region']}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              className={`form-input ${formErrors.password ? 'border-red-500' : ''}`}
            />
            {formErrors.password && <p className="form-error">{formErrors.password}</p>}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              className={`form-input ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
            />
            {formErrors.confirmPassword && <p className="form-error">{formErrors.confirmPassword}</p>}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <button
            type="submit"
            className="btn btn-primary w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : 'Crear Cuenta'}
          </button>
          
          <p className="mt-4 text-center">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
// cliente/src/pages/Login.jsx
import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, currentUser, error } = useContext(AuthContext);

  // Si el usuario ya está autenticado, redirigir a la página principal
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Destructuring de formData
  const { email, password } = formData;

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Validar el formulario
  const validateForm = () => {
    const errors = {};

    // Validar email
    if (!email) {
      errors.email = 'Por favor ingresa tu email';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Email inválido';
    }

    // Validar contraseña
    if (!password) {
      errors.password = 'Por favor ingresa tu contraseña';
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
        await login(email, password);
        // Si llega aquí, el login fue exitoso y el contexto redirigirá
      } catch (err) {
        setIsSubmitting(false);
        // El error ya se maneja en el contexto
      }
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Iniciar Sesión</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {/* Email */}
        <div className="mb-4">
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

        {/* Contraseña */}
        <div className="mb-6">
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

        <div className="flex flex-col items-center">
          <button
            type="submit"
            className="btn btn-primary w-full"
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
            ) : 'Iniciar Sesión'}
          </button>
          
          <p className="mt-4 text-center">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary-600 hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
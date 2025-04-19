// cliente/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  // Verificar si hay un usuario con sesión activa
  const checkUserLoggedIn = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const res = await axios.get('/api/auth/me', config);
      setCurrentUser(res.data);
      setLoading(false);
    } catch (err) {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setError(err.response?.data?.msg || 'Error al verificar sesión');
      setLoading(false);
    }
  };

  // Registrar usuario
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post('/api/auth/register', userData, config);
      
      localStorage.setItem('token', res.data.token);
      await checkUserLoggedIn();
      return res.data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al registrarse');
      setLoading(false);
      throw err;
    }
  };

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post('/api/auth/login', { email, password }, config);
      
      localStorage.setItem('token', res.data.token);
      setCurrentUser(res.data.usuario);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al iniciar sesión');
      setLoading(false);
      throw err;
    }
  };

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // Actualizar perfil
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const res = await axios.put('/api/auth/perfil', userData, config);
      
      setCurrentUser(res.data.usuario);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al actualizar el perfil');
      setLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
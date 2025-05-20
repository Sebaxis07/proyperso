import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null); // Nuevo estado para el rol

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

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
      setUserRole(res.data.rol); // Actualizar el rol al cargar el usuario
      setLoading(false);
    } catch (err) {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setUserRole(null); // Limpiar el rol si hay error
      setError(err.response?.data?.msg || 'Error al verificar sesión');
      setLoading(false);
    }
  };

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
      
      if (res.data.token && res.data.usuario) {
        localStorage.setItem('token', res.data.token);
        // Guardar el rol del usuario
        setUserRole(res.data.usuario.rol);
        setCurrentUser(res.data.usuario);
        
        // Redirigir según el rol
        switch(res.data.usuario.rol) {
          case 'admin':
            window.location.href = '/admin';
            break;
          case 'empleado':
            window.location.href = '/empleado/dashboard';
            break;
          default:
            window.location.href = '/';
        }
      }
      
      setLoading(false);
      return res.data;
    } catch (err) {
      console.error('Error de login:', err.response?.data);
      setError(err.response?.data?.msg || 'Credenciales inválidas');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setUserRole(null); // Limpiar el rol al cerrar sesión
    window.location.href = '/login';
  };

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

  // Función auxiliar para verificar roles
  const hasRole = (allowedRoles) => {
    return currentUser && allowedRoles.includes(currentUser.rol);
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
        updateProfile,
        userRole,
        // Funciones de ayuda para verificar roles
        isAdmin: () => hasRole(['admin']),
        isEmpleado: () => hasRole(['empleado', 'admin']),
        isUser: () => hasRole(['usuario', 'empleado', 'admin'])
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
// cliente/src/components/routing/AdminRoute.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Verificar si el usuario es admin
  if (!currentUser || currentUser.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Si hay usuario autenticado y es admin, renderizar los hijos
  return children;
};

export default AdminRoute;
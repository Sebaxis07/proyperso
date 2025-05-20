// cliente/src/components/routes/EmpleadoRoute.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const EmpleadoRoute = ({ children }) => {
  const { currentUser, loading, isEmpleado } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD15C]"></div>
      </div>
    );
  }
  
  if (!currentUser || !isEmpleado()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default EmpleadoRoute;
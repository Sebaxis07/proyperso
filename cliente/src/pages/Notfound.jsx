import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-8 text-center max-w-xl mx-auto">
      <div className="text-gray-500 mb-6">
        <div className="text-primary-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn btn-primary">
            Ir al inicio
          </Link>
          <Link to="/productos" className="btn btn-outline">
            Ver productos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
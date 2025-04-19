// cliente/src/components/layout/Navbar.jsx
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import logo from '../../assets/Logo.png'; // Asegúrate de que la ruta sea correcta

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const { itemCount } = useContext(CartContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-white to-[#FFF8E7] shadow-md relative z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-4">
              <img 
                src={logo} 
                alt="Lucky Pet Shop Logo" 
                className="h-16 w-16 object-contain" 
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-800">
                  Lucky Pet Shop
                </span>
                <span className="text-sm text-[#FFD15C] font-medium">
                  Tu tienda de mascotas
                </span>
              </div>
            </Link>
          </div>

          {/* Menú de navegación (escritorio) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link">
              Inicio
            </Link>
            <Link to="/productos" className="nav-link">
              Productos
            </Link>
            
            {currentUser ? (
              <div className="flex items-center space-x-8">
                {currentUser.rol === 'admin' && (
                  <div className="relative group">
                    <button className="nav-link flex items-center">
                      <span>Administración</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:rotate-180 transition-transform duration-200" 
                           fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-50">
                      <div className="py-2 px-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-400">Panel Admin</span>
                      </div>
                      <div className="py-2">
                        <Link to="/admin" className="admin-link">
                          Dashboard
                        </Link>
                        <Link to="/admin/productos" className="admin-link">
                          Productos
                        </Link>
                        <Link to="/admin/pedidos" className="admin-link">
                          Pedidos
                        </Link>
                        <Link to="/admin/usuarios" className="admin-link">
                          Usuarios
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                
                <Link to="/pedidos" className="nav-link">
                  Mis Pedidos
                </Link>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="relative group">
                  <button className="nav-link flex items-center">
                    Mi Cuenta
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link to="/perfil" className="admin-link">
                      Mi Perfil
                    </Link>
                    <button onClick={logout} className="admin-link w-full text-left">
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="nav-link">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="bg-[#FFD15C] hover:bg-[#FFC132] text-white px-6 py-2.5 rounded-full font-medium transition-colors duration-200">
                  Registrarse
                </Link>
              </div>
            )}

            {/* Carrito */}
            <Link to="/carrito" className="relative p-2 hover:bg-[#FFF8E7] rounded-full transition-colors duration-200">
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FFD15C] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Botón de menú móvil */}
          <div className="md:hidden flex items-center">
            <Link to="/carrito" className="relative text-gray-600 hover:text-primary-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={toggleMenu}
              type="button"
              className="text-gray-500 hover:text-primary-600 focus:outline-none focus:text-primary-600"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="text-gray-600 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Inicio
            </Link>
            <Link to="/productos" className="text-gray-600 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Productos
            </Link>
            
            {/* Menú de admin para móviles */}
            {currentUser && currentUser.rol === 'admin' && (
              <>
                <div className="border-t border-gray-200 my-2 pt-2">
                  <p className="px-3 py-1 text-sm font-semibold text-gray-500">Administración</p>
                </div>
                <Link to="/admin" className="text-gray-600 hover:text-primary-600 block px-3 py-2 pl-6 rounded-md text-base font-medium">
                  Dashboard
                </Link>
                <Link to="/admin/productos" className="text-gray-600 hover:text-primary-600 block px-3 py-2 pl-6 rounded-md text-base font-medium">
                  Productos
                </Link>
                <Link to="/admin/pedidos" className="text-gray-600 hover:text-primary-600 block px-3 py-2 pl-6 rounded-md text-base font-medium">
                  Pedidos
                </Link>
                <Link to="/admin/usuarios" className="text-gray-600 hover:text-primary-600 block px-3 py-2 pl-6 rounded-md text-base font-medium">
                  Usuarios
                </Link>
              </>
            )}
            
            {currentUser ? (
              <>
                <Link to="/pedidos" className="text-gray-600 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                  Mis Pedidos
                </Link>
                <Link to="/perfil" className="text-gray-600 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                  Mi Perfil
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-primary-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="text-gray-600 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
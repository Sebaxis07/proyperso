import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { FaSearch, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import logo from '../../assets/Logo.png';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const { itemCount } = useContext(CartContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const location = useLocation();
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setShowSearchBar(false);
  }, [location]);

  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBar]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
  };

  return (
    <>
      {/* Top Bar - siempre visible */}
      <div className="bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A] text-white py-2 hidden md:block">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-[#FFD15C] mr-2" />
                <span className="text-gray-300">Av. Esmeralda #1993, Antofagasta</span>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-[#FFD15C] mr-2" />
                <span className="text-gray-300">+56 2 2123 4567</span>
              </div>
            </div>
            <div className="text-sm text-gray-300">
              <span className="mr-2">Horario:</span>
              <span className="text-[#FFD15C]">Lun-Vie: 09:00-20:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar principal */}
      <nav 
        className={`sticky w-full top-0 transition-all duration-300 z-50 
        ${isScrolled 
          ? 'bg-white shadow-lg' 
          : 'bg-white shadow-sm'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo y Branding */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-shrink-0"
            >
              <Link to="/" className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-lg shadow-[0_0_15px_rgba(255,209,92,0.5)]">
                  <img 
                    src={logo} 
                    alt="Lucky Pet Shop Logo" 
                    className="h-12 w-12 object-contain" 
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A] bg-clip-text text-transparent">
                    Lucky Pet Shop
                  </span>
                  <span className="text-sm text-[#FFD15C] font-medium">
                    Tu tienda premium de mascotas
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Search Bar - visible solo cuando se activa */}
            <AnimatePresence>
              {showSearchBar && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100%" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="absolute left-0 top-0 bg-white h-20 z-10 flex items-center justify-center px-8"
                >
                  <div className="w-full max-w-3xl flex items-center border-b-2 border-[#FFD15C]">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Buscar productos, marcas, categorías..."
                      className="w-full py-2 px-4 outline-none text-gray-700"
                    />
                    <button className="p-2 text-[#FFD15C]">
                      <FaSearch />
                    </button>
                    <button 
                      onClick={toggleSearchBar}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enlaces de navegación - desktop */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/">Inicio</NavLink>
              <NavLink to="/productos">Productos</NavLink>
              <NavLink to="/nosotros">Nosotros</NavLink>
              <NavLink to="/contacto">Contacto</NavLink>
              
              {/* Botón de búsqueda */}
              <button 
                onClick={toggleSearchBar}
                className="p-2 ml-2 rounded-full hover:bg-[#FFF8E7] text-gray-700 hover:text-[#FFD15C] transition-all duration-200"
                aria-label="Buscar"
              >
                <FaSearch />
              </button>
              
              {currentUser ? (
                <UserMenu currentUser={currentUser} onLogoutClick={handleLogoutClick} />
              ) : (
                <AuthButtons />
              )}

              <CartButton itemCount={itemCount} />
            </div>

            {/* Botones móviles */}
            <div className="md:hidden flex items-center space-x-4">
              <button 
                onClick={toggleSearchBar}
                className="p-2 rounded-full hover:bg-[#FFF8E7] text-gray-700 hover:text-[#FFD15C] transition-all duration-200"
                aria-label="Buscar"
              >
                <FaSearch />
              </button>
              <CartButton itemCount={itemCount} />
              <MobileMenuButton isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && <MobileMenu currentUser={currentUser} onLogoutClick={handleLogoutClick} />}
        </AnimatePresence>
      </nav>
      
      <ConfirmLogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative group
        ${isActive 
          ? 'text-[#FFD15C] bg-[#FFF8E7]' 
          : 'text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7]/50'
        }`}
    >
      {children}
      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#FFD15C] transition-all duration-300 
                        ${isActive ? 'w-1/2' : 'w-0 group-hover:w-1/4'}`} />
    </Link>
  );
};

const UserMenu = ({ currentUser, onLogoutClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] transition-all duration-200"
      >
        <span>{currentUser.nombre}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-800">{currentUser.nombre} {currentUser.apellido}</p>
            <p className="text-xs text-gray-500 mt-1">{currentUser.email}</p>
            <div className={`text-xs mt-2 inline-block px-2 py-0.5 rounded-full font-medium ${
              currentUser?.rol === 'admin' ? 'bg-[#FFD15C]/20 text-[#FFD15C]' : 'bg-green-100 text-green-700'
            }`}>
              {currentUser?.rol === 'admin' ? 'Administrador' : 'Cliente'}
            </div>
          </div>

          <div className="py-1">
            <Link
              to="/perfil"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] group"
            >
              <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
              <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mi Perfil
            </Link>
            <Link
              to="/pedidos"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] group"
            >
              <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
              <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Mis Pedidos
            </Link>
            <Link
              to="/favoritos"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] group"
            >
              <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
              <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Mis Favoritos
            </Link>
          </div>

          {currentUser.rol === 'admin' && (
            <div className="py-1 border-t border-gray-100">
              <div className="px-4 py-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Administración
                </span>
              </div>
              <Link
                to="/admin"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] group"
              >
                <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2z" />
                </svg>
                Dashboard
              </Link>
              <Link
                to="/admin/productos"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] group"
              >
                <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Productos
              </Link>
              <Link
                to="/admin/pedidos"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] group"
              >
                <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Pedidos
              </Link>
              <Link
                to="/admin/usuarios"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] group"
              >
                <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Usuarios
              </Link>
              <Link
                to="/admin/reportes"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] group"
              >
                <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Reportes
              </Link>
            </div>
          )}

          {currentUser?.rol === 'empleado' && (
            <>
              <div className="py-1 border-t border-gray-100">
                <div className="px-4 py-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Panel de Empleado
                  </span>
                </div>
                <Link
                  to="/empleado/pedidos"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] group"
                >
                  <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                  <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Gestionar Pedidos
                </Link>
                <Link
                  to="/empleado/productos"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] group"
                >
                  <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                  <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Gestionar Stock
                </Link>
                <Link
                  to="/empleado/chat"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] group"
                >
                  <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                  <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat con Clientes
                </Link>
              </div>
            </>
          )}

          <div className="py-1 border-t border-gray-100">
            <button
              onClick={onLogoutClick}
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 group"
            >
              <span className="h-[2px] w-0 bg-red-500 mr-2 transition-all duration-300 group-hover:w-4" />
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const AuthButtons = () => {
  return (
    <div className="flex items-center space-x-2">
      <Link
        to="/login"
        className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] transition-all duration-200"
      >
        Iniciar Sesión
      </Link>
      <Link
        to="/register"
        className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#FFD15C] to-[#FFC132] text-white hover:from-[#FFC132] hover:to-[#FFB100] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
      >
        Registrarse
      </Link>
    </div>
  );
};

const CartButton = ({ itemCount }) => {
  return (
    <Link
      to="/carrito"
      className="relative p-2 rounded-full hover:bg-[#FFF8E7] transition-all duration-200 group"
      aria-label="Ver carrito de compras"
    >
      <svg
        className="w-6 h-6 text-gray-700 group-hover:text-[#FFD15C] transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#FFD15C] to-[#FFC132] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
};

const MobileMenuButton = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-[#FFF8E7] transition-all duration-200"
      aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
    >
      <svg
        className="w-6 h-6 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
};

const MobileMenu = ({ currentUser, onLogoutClick }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-20 inset-x-0 bg-white shadow-lg py-4 border-b border-gray-200 z-40"
      >
        <div className="container mx-auto px-4 space-y-1">
          <Link
            to="/"
            className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
          >
            <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
            <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Inicio
          </Link>
          <Link
            to="/productos"
            className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
          >
            <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
            <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Productos
          </Link>
          
          <Link
            to="/nosotros"
            className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
          >
            <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
            <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Nosotros
          </Link>
          <Link
            to="/contacto"
            className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
          >
            <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
            <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contacto
          </Link>
          
          {currentUser ? (
            <>
              <div className="pt-3 pb-1 border-t border-gray-200 mt-2">
                <div className="px-4 py-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {currentUser?.rol === 'admin' ? 'Panel Administrativo' : 'Mi Cuenta'}
                  </span>
                </div>
                <div className="px-4 py-1">
                  <span className={`text-xs inline-block px-2 py-0.5 rounded-full font-medium ${
                    currentUser?.rol === 'admin' ? 'bg-[#FFD15C]/20 text-[#FFD15C]' : 'bg-green-100 text-green-700'
                  }`}>
                    {currentUser?.rol === 'admin' ? 'Administrador' : 'Cliente'}
                  </span>
                </div>
              </div>
              <Link
                to="/perfil"
                className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
              >
                <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi Perfil
              </Link>
              <Link
                to="/mis-pedidos"
                className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
              >
                <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Mis Pedidos
              </Link>
              <Link
                to="/favoritos"
                className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
              >
                <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Mis Favoritos
              </Link>

              {/* Panel de Administración Móvil */}
              {currentUser.rol === 'admin' && (
                <>
                  <div className="pt-3 pb-1 border-t border-gray-200 mt-2">
                    <div className="px-4 py-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Administración
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/admin"
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
                  >
                    <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2z" />
                    </svg>
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/productos"
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
                  >
                    <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Productos
                  </Link>
                  <Link
                    to="/admin/pedidos"
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
                  >
                    <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Pedidos
                  </Link>
                  <Link
                    to="/admin/usuarios"
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
                  >
                    <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Usuarios
                  </Link>
                  <Link
                    to="/admin/reportes"
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
                  >
                    <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Reportes
                  </Link>
                </>
              )}

              {currentUser.rol === 'empleado' && (
                <>
                  <div className="pt-3 pb-1 border-t border-gray-200 mt-2">
                    <div className="px-4 py-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Panel de Empleado
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/empleado/pedidos"
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
                  >
                    <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Gestionar Pedidos
                  </Link>
                  <Link
                    to="/empleado/productos"
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
                  >
                    <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Gestionar Stock
                  </Link>
                  <Link
                    to="/empleado/chat"
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
                  >
                    <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat con Clientes
                  </Link>
                </>
              )}

              <div className="pt-3 pb-1 border-t border-gray-200 mt-2">
                <button
                  onClick={onLogoutClick}
                  className="flex w-full items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg group"
                >
                  <span className="h-[2px] w-0 bg-red-500 mr-2 transition-all duration-300 group-hover:w-4" />
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="pt-3 pb-1 border-t border-gray-200 mt-2">
                <div className="px-4 py-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acceso
                  </span>
                </div>
              </div>
              <Link
                to="/login"
                className="flex items-center px-4 py-3 text-gray-700 hover:text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
              >
                <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="flex items-center px-4 py-3 text-[#FFD15C] hover:bg-[#FFF8E7] rounded-lg group"
              >
                <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
                <svg className="w-5 h-5 mr-3 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </motion.div>
      </>
    );
  };
  
  const ConfirmLogoutModal = ({ isOpen, onClose, onConfirm }) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 z-50 w-[90%] max-w-md"
              style={{ margin: 0 }} // Aseguramos que no tenga márgenes que afecten su posición
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cerrar Sesión
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro que deseas cerrar sesión?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-colors shadow-md"
                >
                  Cerrar Sesión
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };
  
  export default Navbar;
// cliente/src/pages/Cart.jsx
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Cart = () => {
  const { cart, total, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const costoEnvio = total > 30000 ? 0 : 3990;
  const totalConEnvio = total + costoEnvio;

  // Modificar la función de actualización de cantidad
  const handleQuantityChange = (itemId, newQuantity, stockDisponible) => {
    if (newQuantity < 1) {
      return;
    }
    
    if (newQuantity > stockDisponible) {
      // Opcional: Mostrar un mensaje de error
      alert(`Solo hay ${stockDisponible} unidades disponibles`);
      // Establecer la cantidad al máximo disponible
      updateQuantity(itemId, stockDisponible);
      return;
    }
    
    updateQuantity(itemId, newQuantity);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 flex items-center gap-3">
        <svg className="w-8 h-8 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Carrito de Compra
      </h1>

      {cart.length === 0 ? (
        <div className="bg-white shadow-lg rounded-2xl p-10 text-center animate-fadeIn">
          <svg className="h-20 w-20 mx-auto mb-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-2xl font-semibold mb-2 text-gray-700">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-6">¡Agrega productos y disfruta de nuestras ofertas!</p>
          <Link to="/productos" className="inline-block bg-[#FFD15C] hover:bg-[#FFC132] text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300">
            Explorar Productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Lista de productos */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="p-6 bg-gray-50 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Productos en tu carrito <span className="ml-2 bg-[#FFD15C] text-white px-3 py-1 rounded-full text-xs font-bold">{cart.length}</span>
                </h2>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Vaciar carrito
                </button>
              </div>
              <ul className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <li key={item._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Imagen */}
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <img
                          src={item.imagenUrl || '/placeholder-product.jpg'}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Detalles */}
                      <div className="flex-grow w-full">
                        <Link to={`/productos/${item._id}`} className="text-lg font-bold text-gray-800 hover:text-[#FFD15C] transition-colors duration-200">
                          {item.nombre}
                        </Link>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <span className="capitalize">{item.tipoMascota}</span>
                          <span className="mx-1">•</span>
                          <span className="capitalize">{item.categoria}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
                          {/* Precio */}
                          <div className="font-semibold text-[#FFD15C] text-lg">
                            {formatPrice(item.precio)} <span className="text-xs text-gray-500">c/u</span>
                          </div>
                          {/* Controles de cantidad */}
                          <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                            <button
                              onClick={() => handleQuantityChange(item._id, item.cantidad - 1, item.stock)}
                              disabled={item.cantidad <= 1}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.stock}
                              value={item.cantidad}
                              onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value), item.stock)}
                              className="w-12 h-8 border-0 bg-transparent text-center text-base font-semibold"
                            />
                            <button
                              onClick={() => handleQuantityChange(item._id, item.cantidad + 1, item.stock)}
                              disabled={item.cantidad >= item.stock}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          {/* Subtotal y eliminar */}
                          <div className="flex items-center gap-4">
                            <div className="font-bold text-gray-700">
                              {formatPrice(item.precio * item.cantidad)}
                            </div>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Eliminar"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {/* Agregar indicador de stock */}
                        {item.cantidad >= item.stock && (
                          <p className="text-sm text-red-500 mt-1">
                            Stock máximo alcanzado
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-2xl p-8 sticky top-6 animate-fadeIn">
              <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                Resumen del pedido
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  {costoEnvio === 0 ? (
                    <span className="font-semibold text-green-600 animate-pulse">GRATIS</span>
                  ) : (
                    <span className="font-semibold">{formatPrice(costoEnvio)}</span>
                  )}
                </div>
                {costoEnvio > 0 && (
                  <div className="text-xs text-gray-500">
                    Envío gratis en compras superiores a <span className="font-semibold">{formatPrice(30000)}</span>
                  </div>
                )}
                <div className="h-px bg-gray-200 my-3"></div>
                <div className="flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-extrabold text-2xl text-[#FFD15C]">{formatPrice(totalConEnvio)}</span>
                </div>
              </div>
              {currentUser ? (
                <Link
                  to="/checkout"
                  className="w-full block bg-[#FFD15C] hover:bg-[#FFC132] text-white font-bold py-3 rounded-full shadow-lg text-center transition-all duration-300"
                >
                  Proceder al pago
                </Link>
              ) : (
                <div>
                  <Link
                    to="/login"
                    className="w-full block bg-[#FFD15C] hover:bg-[#FFC132] text-white font-bold py-3 rounded-full shadow-lg text-center mb-3 transition-all duration-300"
                  >
                    Iniciar sesión para continuar
                  </Link>
                  <p className="text-sm text-gray-600 text-center">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-[#FFD15C] hover:underline font-semibold">
                      Regístrate aquí
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
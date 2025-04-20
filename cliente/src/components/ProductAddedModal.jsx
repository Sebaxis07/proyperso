import { Link } from 'react-router-dom';

const ProductAddedModal = ({ isOpen, onClose, product, quantity }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
          <div className="text-center">
            {/* Ícono de éxito */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¡Producto agregado al carrito!
            </h3>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <img 
                  src={product.imagenUrl || '/placeholder-product.jpg'} 
                  alt={product.nombre}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{product.nombre}</p>
                  <p className="text-sm text-gray-500">Cantidad: {quantity}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link 
                to="/carrito"
                className="flex-1 bg-[#FFD15C] text-white px-4 py-2 rounded-xl hover:bg-[#FFC132] transition-colors font-medium"
              >
                Ir al carrito
              </Link>
              <button 
                onClick={onClose}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAddedModal;
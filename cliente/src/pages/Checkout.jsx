// cliente/src/pages/Checkout.jsx
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);
  
  // Si no hay productos en el carrito, redirigir
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/carrito');
    }
  }, [cart, navigate]);

  // Estados del formulario
  const [formData, setFormData] = useState({
    direccionEnvio: {
      calle: currentUser?.direccion?.calle || '',
      numero: currentUser?.direccion?.numero || '',
      comuna: currentUser?.direccion?.comuna || '',
      ciudad: currentUser?.direccion?.ciudad || '',
      region: currentUser?.direccion?.region || '',
      codigoPostal: currentUser?.direccion?.codigoPostal || ''
    },
    metodoPago: 'webpay'
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ordenCreada, setOrdenCreada] = useState(null);

  // Calcular costos de envío (gratis para compras mayores a $30.000)
  const costoEnvio = total > 30000 ? 0 : 3990;
  const totalConEnvio = total + costoEnvio;

  // Formatear precio como moneda chilena
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Manejar cambios en campos anidados (dirección)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      // Manejar cambios en campos normales
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Validar el formulario
  const validateForm = () => {
    const errors = {};

    // Validar campos obligatorios de dirección
    if (!formData.direccionEnvio.calle.trim()) {
      errors['direccionEnvio.calle'] = 'La calle es obligatoria';
    }
    if (!formData.direccionEnvio.numero.trim()) {
      errors['direccionEnvio.numero'] = 'El número es obligatorio';
    }
    if (!formData.direccionEnvio.comuna.trim()) {
      errors['direccionEnvio.comuna'] = 'La comuna es obligatoria';
    }
    if (!formData.direccionEnvio.ciudad.trim()) {
      errors['direccionEnvio.ciudad'] = 'La ciudad es obligatoria';
    }
    if (!formData.direccionEnvio.region.trim()) {
      errors['direccionEnvio.region'] = 'La región es obligatoria';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No estás autenticado');
        }
        
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };

        // Preparar datos del pedido
        const pedidoData = {
          productos: cart.map(item => ({
            producto: item._id,
            cantidad: item.cantidad
          })),
          direccionEnvio: formData.direccionEnvio,
          metodoPago: formData.metodoPago
        };

        // Crear pedido
        const res = await axios.post('/api/pedidos', pedidoData, config);
        
        // Guardar la orden creada
        setOrdenCreada(res.data.data);
        
        // Limpiar carrito
        clearCart();
        
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err.response?.data?.msg || 'Error al procesar el pedido. Por favor, intenta nuevamente.');
        console.error('Error al crear pedido:', err);
      }
    }
  };

  // Si ya se creó la orden, mostrar página de confirmación
  if (ordenCreada) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white shadow-md rounded-lg p-8 mb-8">
          <div className="text-green-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold mt-4">¡Pedido realizado con éxito!</h2>
          </div>
          
          <p className="text-gray-700 mb-6">
            Tu pedido #{ordenCreada.numeroPedido} ha sido registrado correctamente.
          </p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate(`/pedidos/${ordenCreada._id}`)}
              className="btn btn-primary"
            >
              Ver detalles del pedido
            </button>
            
            <button
              onClick={() => navigate('/productos')}
              className="btn btn-outline"
            >
              Seguir comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de checkout */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Dirección de Envío</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Calle */}
                <div>
                  <label htmlFor="direccionEnvio.calle" className="form-label">Calle</label>
                  <input
                    type="text"
                    id="direccionEnvio.calle"
                    name="direccionEnvio.calle"
                    value={formData.direccionEnvio.calle}
                    onChange={handleChange}
                    className={`form-input ${formErrors['direccionEnvio.calle'] ? 'border-red-500' : ''}`}
                  />
                  {formErrors['direccionEnvio.calle'] && <p className="form-error">{formErrors['direccionEnvio.calle']}</p>}
                </div>

                {/* Número */}
                <div>
                  <label htmlFor="direccionEnvio.numero" className="form-label">Número</label>
                  <input
                    type="text"
                    id="direccionEnvio.numero"
                    name="direccionEnvio.numero"
                    value={formData.direccionEnvio.numero}
                    onChange={handleChange}
                    className={`form-input ${formErrors['direccionEnvio.numero'] ? 'border-red-500' : ''}`}
                  />
                  {formErrors['direccionEnvio.numero'] && <p className="form-error">{formErrors['direccionEnvio.numero']}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Comuna */}
                <div>
                  <label htmlFor="direccionEnvio.comuna" className="form-label">Comuna</label>
                  <input
                    type="text"
                    id="direccionEnvio.comuna"
                    name="direccionEnvio.comuna"
                    value={formData.direccionEnvio.comuna}
                    onChange={handleChange}
                    className={`form-input ${formErrors['direccionEnvio.comuna'] ? 'border-red-500' : ''}`}
                  />
                  {formErrors['direccionEnvio.comuna'] && <p className="form-error">{formErrors['direccionEnvio.comuna']}</p>}
                </div>

                {/* Ciudad */}
                <div>
                  <label htmlFor="direccionEnvio.ciudad" className="form-label">Ciudad</label>
                  <input
                    type="text"
                    id="direccionEnvio.ciudad"
                    name="direccionEnvio.ciudad"
                    value={formData.direccionEnvio.ciudad}
                    onChange={handleChange}
                    className={`form-input ${formErrors['direccionEnvio.ciudad'] ? 'border-red-500' : ''}`}
                  />
                  {formErrors['direccionEnvio.ciudad'] && <p className="form-error">{formErrors['direccionEnvio.ciudad']}</p>}
                </div>

                {/* Región */}
                <div>
                  <label htmlFor="direccionEnvio.region" className="form-label">Región</label>
                  <input
                    type="text"
                    id="direccionEnvio.region"
                    name="direccionEnvio.region"
                    value={formData.direccionEnvio.region}
                    onChange={handleChange}
                    className={`form-input ${formErrors['direccionEnvio.region'] ? 'border-red-500' : ''}`}
                  />
                  {formErrors['direccionEnvio.region'] && <p className="form-error">{formErrors['direccionEnvio.region']}</p>}
                </div>
              </div>

              <div className="mb-6">
                {/* Código Postal */}
                <div>
                  <label htmlFor="direccionEnvio.codigoPostal" className="form-label">Código Postal (opcional)</label>
                  <input
                    type="text"
                    id="direccionEnvio.codigoPostal"
                    name="direccionEnvio.codigoPostal"
                    value={formData.direccionEnvio.codigoPostal}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-6 mt-10">Método de Pago</h2>
              
              <div className="space-y-4">
                <div className="flex items-center p-4 border rounded-md">
                  <input
                    type="radio"
                    id="webpay"
                    name="metodoPago"
                    value="webpay"
                    checked={formData.metodoPago === 'webpay'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="webpay" className="ml-3 block text-gray-800">
                    <span className="font-medium">WebPay</span>
                    <span className="block text-sm text-gray-500">Pago con tarjeta de crédito o débito</span>
                  </label>
                </div>
                
                <div className="flex items-center p-4 border rounded-md">
                  <input
                    type="radio"
                    id="transferencia"
                    name="metodoPago"
                    value="transferencia"
                    checked={formData.metodoPago === 'transferencia'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="transferencia" className="ml-3 block text-gray-800">
                    <span className="font-medium">Transferencia Bancaria</span>
                    <span className="block text-sm text-gray-500">Transferencia desde cualquier banco</span>
                  </label>
                </div>
                
                <div className="flex items-center p-4 border rounded-md">
                  <input
                    type="radio"
                    id="efectivo"
                    name="metodoPago"
                    value="efectivo"
                    checked={formData.metodoPago === 'efectivo'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="efectivo" className="ml-3 block text-gray-800">
                    <span className="font-medium">Efectivo al recibir</span>
                    <span className="block text-sm text-gray-500">Pago contra entrega</span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-6">Resumen del pedido</h2>
            
            <div className="max-h-60 overflow-y-auto mb-6">
              <ul className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <li key={item._id} className="py-3 flex justify-between">
                    <div>
                      <p className="font-medium">{item.nombre}</p>
                      <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.precio * item.cantidad)}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío</span>
                {costoEnvio === 0 ? (
                  <span className="font-medium text-green-600">GRATIS</span>
                ) : (
                  <span className="font-medium">{formatPrice(costoEnvio)}</span>
                )}
              </div>
              <div className="h-px bg-gray-200 my-3"></div>
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-xl">{formatPrice(totalConEnvio)}</span>
              </div>
            </div>
            
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary w-full py-3 text-center"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : 'Confirmar Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
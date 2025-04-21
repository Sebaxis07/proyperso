// cliente/src/pages/Checkout.jsx
import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useContext(CartContext);
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
      departamento: currentUser?.direccion?.departamento || '',
      comuna: currentUser?.direccion?.comuna || '',
      ciudad: currentUser?.direccion?.ciudad || '',
      region: currentUser?.direccion?.region || '',
      codigoPostal: currentUser?.direccion?.codigoPostal || '',
      instrucciones: currentUser?.direccion?.instrucciones || ''
    },
    metodoPago: 'webpay',
    guardaDireccion: true
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ordenCreada, setOrdenCreada] = useState(null);
  const [etapa, setEtapa] = useState(1); // 1: Dirección, 2: Método de Pago, 3: Confirmación

  // Función para calcular precio con descuento
  const getDiscountedPrice = (item) => {
    // Caso 1: Si tiene oferta y descuento como propiedades
    if (item.oferta && item.descuento) {
      return item.precio - (item.precio * (item.descuento / 100));
    }
    
    // Caso 2: Si tiene directamente precioOferta
    if (item.precioOferta) {
      return item.precioOferta;
    }
    
    // Caso 3: Si tiene descuentoActivo y porcentajeDescuento
    if (item.descuentoActivo && item.porcentajeDescuento) {
      return item.precio - (item.precio * (item.porcentajeDescuento / 100));
    }
    
    // Caso 4: Si tiene enOferta y descuento
    if (item.enOferta && item.descuento) {
      return item.precio - (item.precio * (item.descuento / 100));
    }
    
    // Por defecto, devolver precio original
    return item.precio;
  };

  // Verificar si un producto tiene algún tipo de descuento
  const hasDiscount = (item) => {
    return (
      (item.oferta && item.descuento) || 
      item.precioOferta || 
      (item.descuentoActivo && item.porcentajeDescuento) ||
      (item.enOferta && item.descuento)
    );
  };

  // Calcular totales
  const calcularTotales = () => {
    // Subtotal sin descuentos
    const subtotalOriginal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    // Subtotal con descuentos aplicados
    const subtotalConDescuentos = cart.reduce((sum, item) => {
      const precioConDescuento = getDiscountedPrice(item);
      return sum + (precioConDescuento * item.cantidad);
    }, 0);
    
    // Ahorro total por descuentos
    const ahorroTotal = subtotalOriginal - subtotalConDescuentos;
    
    // Costo de envío (gratis para compras mayores a $30.000)
    const costoEnvio = subtotalConDescuentos > 30000 ? 0 : 3990;
    
    // Total final con envío incluido
    const totalFinal = subtotalConDescuentos + costoEnvio;
    
    return {
      subtotalOriginal,
      subtotalConDescuentos,
      ahorroTotal,
      costoEnvio,
      totalFinal
    };
  };

  const totales = calcularTotales();

  // Formatear precio como moneda chilena
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
      return;
    }
    
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

  // Avanzar a la siguiente etapa
  const siguienteEtapa = () => {
    if (etapa === 1 && validateForm()) {
      setEtapa(2);
    } else if (etapa === 2) {
      setEtapa(3);
    }
  };

  // Regresar a la etapa anterior
  const etapaAnterior = () => {
    if (etapa > 1) {
      setEtapa(etapa - 1);
    }
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

        // Verificar si hay items en el carrito
        if (cart.length === 0) {
          throw new Error('No hay productos en el carrito');
        }
        
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };

        // Preparar productos con precios correctos (con descuentos aplicados)
        const productosConPreciosCorrectos = cart.map(item => ({
          producto: item._id,
          cantidad: item.cantidad,
          precioUnitario: getDiscountedPrice(item), // Precio con descuento si aplica
          precioOriginal: item.precio, // Precio original para referencia
          nombre: item.nombre,
          descuento: hasDiscount(item) ? (item.descuento || 0) : 0 // Porcentaje de descuento
        }));

        // Modificación en la preparación de datos
        const pedidoData = {
          productos: productosConPreciosCorrectos,
          direccionEnvio: formData.direccionEnvio,
          metodoPago: formData.metodoPago,
          subtotal: totales.subtotalConDescuentos,
          ahorroTotal: totales.ahorroTotal,
          costoEnvio: totales.costoEnvio,
          total: totales.totalFinal,
          guardaDireccion: formData.guardaDireccion,
          estado: 'pendiente'
        };

        console.log('Datos enviados:', pedidoData); // Para debug

        const res = await axios.post('/api/pedidos', pedidoData, config);
        
        if (res.data.success === false) {
          throw new Error(res.data.message || 'Error al crear el pedido');
        }

        setOrdenCreada(res.data.data);
        clearCart();
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error('Error completo:', err);
        setError(err.response?.data?.msg || err.message || 'Error al procesar el pedido');
      }
    }
  };

  // Si ya se creó la orden, mostrar página de confirmación
  if (ordenCreada) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-fadeIn">
        <div className="bg-white shadow-lg rounded-2xl p-12 text-center">
          <div className="rounded-full bg-green-100 w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Pedido realizado con éxito!</h2>
          
          <p className="text-gray-600 mb-8 text-lg">
            Tu pedido #{ordenCreada.numeroPedido || ordenCreada._id.substring(0, 8)} ha sido registrado correctamente.
            <br />Te enviaremos un correo con la confirmación y estado de tu compra.
          </p>
          
          {formData.metodoPago === 'transferencia' && (
            <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-bold text-blue-800 mb-2">Datos para transferencia:</h3>
              <ul className="text-blue-700 space-y-1">
                <li><strong>Banco:</strong> Banco Estado</li>
                <li><strong>Tipo de cuenta:</strong> Cuenta Corriente</li>
                <li><strong>Número:</strong> 0000000000</li>
                <li><strong>RUT:</strong> 00.000.000-0</li>
                <li><strong>Nombre:</strong> Pet Shop SpA</li>
                <li><strong>Correo:</strong> pagos@petshop.cl</li>
                <li><strong>Monto:</strong> {formatPrice(totales.totalFinal)}</li>
              </ul>
              <p className="text-blue-700 mt-2 text-sm">
                ⚠️ Enviar comprobante a pagos@petshop.cl indicando tu nombre y número de pedido.
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Link
              to={`/mis-pedidos/${ordenCreada._id}`}
              className="btn-primary"
            >
              Ver detalles del pedido
            </Link>
            
            <Link
              to="/productos"
              className="btn-secondary"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 flex items-center gap-3">
        <svg className="w-8 h-8 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        Finalizar Compra
      </h1>
      
      {/* Barra de progreso */}
      <div className="mb-12">
        <div className="flex justify-between items-center">
          <div className={`flex flex-col items-center ${etapa >= 1 ? 'text-[#FFD15C]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${etapa >= 1 ? 'bg-[#FFD15C] text-white' : 'bg-gray-200'}`}>
              <span>1</span>
            </div>
            <span className="text-sm font-medium">Dirección</span>
          </div>
          
          <div className={`flex-1 h-1 mx-2 ${etapa >= 2 ? 'bg-[#FFD15C]' : 'bg-gray-200'}`}></div>
          
          <div className={`flex flex-col items-center ${etapa >= 2 ? 'text-[#FFD15C]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${etapa >= 2 ? 'bg-[#FFD15C] text-white' : 'bg-gray-200'}`}>
              <span>2</span>
            </div>
            <span className="text-sm font-medium">Método de Pago</span>
          </div>
          
          <div className={`flex-1 h-1 mx-2 ${etapa >= 3 ? 'bg-[#FFD15C]' : 'bg-gray-200'}`}></div>
          
          <div className={`flex flex-col items-center ${etapa >= 3 ? 'text-[#FFD15C]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${etapa >= 3 ? 'bg-[#FFD15C] text-white' : 'bg-gray-200'}`}>
              <span>3</span>
            </div>
            <span className="text-sm font-medium">Confirmación</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de checkout */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl overflow-hidden">
            {/* Dirección de envío */}
            {etapa === 1 && (
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Dirección de Envío
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Calle */}
                  <div>
                    <label htmlFor="direccionEnvio.calle" className="block text-sm font-medium text-gray-700 mb-1">
                      Calle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="direccionEnvio.calle"
                      name="direccionEnvio.calle"
                      value={formData.direccionEnvio.calle}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${formErrors['direccionEnvio.calle'] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent`}
                      placeholder="Nombre de la calle"
                    />
                    {formErrors['direccionEnvio.calle'] && <p className="mt-1 text-sm text-red-500">{formErrors['direccionEnvio.calle']}</p>}
                  </div>

                  {/* Número */}
                  <div>
                    <label htmlFor="direccionEnvio.numero" className="block text-sm font-medium text-gray-700 mb-1">
                      Número <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="direccionEnvio.numero"
                      name="direccionEnvio.numero"
                      value={formData.direccionEnvio.numero}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${formErrors['direccionEnvio.numero'] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent`}
                      placeholder="123"
                    />
                    {formErrors['direccionEnvio.numero'] && <p className="mt-1 text-sm text-red-500">{formErrors['direccionEnvio.numero']}</p>}
                  </div>
                </div>

                <div className="mb-6">
                  {/* Departamento / Casa */}
                  <div>
                    <label htmlFor="direccionEnvio.departamento" className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento / Casa (opcional)
                    </label>
                    <input
                      type="text"
                      id="direccionEnvio.departamento"
                      name="direccionEnvio.departamento"
                      value={formData.direccionEnvio.departamento}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent"
                      placeholder="Apto 42, Casa B, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Comuna */}
                  <div>
                    <label htmlFor="direccionEnvio.comuna" className="block text-sm font-medium text-gray-700 mb-1">
                      Comuna <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="direccionEnvio.comuna"
                      name="direccionEnvio.comuna"
                      value={formData.direccionEnvio.comuna}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${formErrors['direccionEnvio.comuna'] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent`}
                      placeholder="Comuna"
                    />
                    {formErrors['direccionEnvio.comuna'] && <p className="mt-1 text-sm text-red-500">{formErrors['direccionEnvio.comuna']}</p>}
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label htmlFor="direccionEnvio.ciudad" className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="direccionEnvio.ciudad"
                      name="direccionEnvio.ciudad"
                      value={formData.direccionEnvio.ciudad}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${formErrors['direccionEnvio.ciudad'] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent`}
                      placeholder="Ciudad"
                    />
                    {formErrors['direccionEnvio.ciudad'] && <p className="mt-1 text-sm text-red-500">{formErrors['direccionEnvio.ciudad']}</p>}
                  </div>

                  {/* Región */}
                  <div>
                    <label htmlFor="direccionEnvio.region" className="block text-sm font-medium text-gray-700 mb-1">
                      Región <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="direccionEnvio.region"
                      name="direccionEnvio.region"
                      value={formData.direccionEnvio.region}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${formErrors['direccionEnvio.region'] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent`}
                    >
                      <option value="">Selecciona región</option>
                      <option value="Región Metropolitana">Región Metropolitana</option>
                      <option value="Región de Valparaíso">Región de Valparaíso</option>
                      <option value="Región del Bío Bío">Región del Bío Bío</option>
                      <option value="Región de La Araucanía">Región de La Araucanía</option>
                      <option value="Región de Coquimbo">Región de Coquimbo</option>
                      <option value="Región de O'Higgins">Región de O'Higgins</option>
                      <option value="Región del Maule">Región del Maule</option>
                      <option value="Región de Los Lagos">Región de Los Lagos</option>
                      <option value="Región de Tarapacá">Región de Tarapacá</option>
                      <option value="Región de Antofagasta">Región de Antofagasta</option>
                      <option value="Región de Atacama">Región de Atacama</option>
                      <option value="Región de Los Ríos">Región de Los Ríos</option>
                      <option value="Región de Arica y Parinacota">Región de Arica y Parinacota</option>
                      <option value="Región de Magallanes">Región de Magallanes</option>
                      <option value="Región de Aysén">Región de Aysén</option>
                      <option value="Región de Ñuble">Región de Ñuble</option>
                    </select>
                    {formErrors['direccionEnvio.region'] && <p className="mt-1 text-sm text-red-500">{formErrors['direccionEnvio.region']}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Código Postal */}
                  <div>
                    <label htmlFor="direccionEnvio.codigoPostal" className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal (opcional)
                    </label>
                    <input
                      type="text"
                      id="direccionEnvio.codigoPostal"
                      name="direccionEnvio.codigoPostal"
                      value={formData.direccionEnvio.codigoPostal}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent"
                      placeholder="Código postal"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  {/* Instrucciones */}
                  <div>
                    <label htmlFor="direccionEnvio.instrucciones" className="block text-sm font-medium text-gray-700 mb-1">
                      Instrucciones de entrega (opcional)
                    </label>
                    <textarea
                      id="direccionEnvio.instrucciones"
                      name="direccionEnvio.instrucciones"
                      value={formData.direccionEnvio.instrucciones}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent"
                      rows="2"
                      placeholder="Ej: Dejar con conserjería, timbre no funciona, etc."
                    ></textarea>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="guardaDireccion"
                      name="guardaDireccion"
                      checked={formData.guardaDireccion}
                      onChange={handleChange}
                      className="h-5 w-5 text-[#FFD15C] rounded focus:ring-[#FFD15C]"
                    />
                    <label htmlFor="guardaDireccion" className="ml-2 block text-sm text-gray-700">
                      Guardar esta dirección para futuras compras
                    </label>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    onClick={siguienteEtapa}
                    className="py-3 px-6 bg-[#FFD15C] hover:bg-[#FFC132] text-white font-bold rounded-full shadow-md transition-all duration-300 flex items-center gap-2"
                  >
                    Continuar
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Método de pago */}
            {etapa === 2 && (
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Método de Pago
                </h2>
                
                <div className="space-y-4 mb-8">
                  <div className={`flex items-center p-5 border rounded-xl ${formData.metodoPago ==='webpay' ? 'border-[#FFD15C] bg-[#FFF9E6]' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      id="webpay"
                      name="metodoPago"
                      value="webpay"
                      checked={formData.metodoPago === 'webpay'}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#FFD15C] focus:ring-[#FFD15C]"
                    />
                    <label htmlFor="webpay" className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-lg font-semibold text-gray-800">WebPay</span>
                          <span className="block text-sm text-gray-600 mt-1">Pago seguro con tarjeta de crédito o débito</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img src="/img/payment/webpay.svg" alt="WebPay" className="h-8" />
                          <img src="/img/payment/visa.svg" alt="Visa" className="h-6" />
                          <img src="/img/payment/mastercard.svg" alt="Mastercard" className="h-6" />
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  <div className={`flex items-center p-5 border rounded-xl ${formData.metodoPago === 'transferencia' ? 'border-[#FFD15C] bg-[#FFF9E6]' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      id="transferencia"
                      name="metodoPago"
                      value="transferencia"
                      checked={formData.metodoPago === 'transferencia'}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#FFD15C] focus:ring-[#FFD15C]"
                    />
                    <label htmlFor="transferencia" className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-lg font-semibold text-gray-800">Transferencia Bancaria</span>
                          <span className="block text-sm text-gray-600 mt-1">Transferencia desde tu banco</span>
                        </div>
                        <div>
                          <img src="/img/payment/bank.svg" alt="Transferencia" className="h-8" />
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  <div className={`flex items-center p-5 border rounded-xl ${formData.metodoPago === 'efectivo' ? 'border-[#FFD15C] bg-[#FFF9E6]' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      id="efectivo"
                      name="metodoPago"
                      value="efectivo"
                      checked={formData.metodoPago === 'efectivo'}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#FFD15C] focus:ring-[#FFD15C]"
                    />
                    <label htmlFor="efectivo" className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-lg font-semibold text-gray-800">Efectivo al recibir</span>
                          <span className="block text-sm text-gray-600 mt-1">Pago contra entrega</span>
                        </div>
                        <div>
                          <img src="/img/payment/cash.svg" alt="Efectivo" className="h-8" />
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={etapaAnterior}
                    className="py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full shadow-md transition-all duration-300 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver
                  </button>
                  
                  <button
                    type="button"
                    onClick={siguienteEtapa}
                    className="py-3 px-6 bg-[#FFD15C] hover:bg-[#FFC132] text-white font-bold rounded-full shadow-md transition-all duration-300 flex items-center gap-2"
                  >
                    Continuar
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Confirmación de pedido */}
            {etapa === 3 && (
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirmación del Pedido
                </h2>
                
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-800 mb-2">Dirección de Envío</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700">
                      {formData.direccionEnvio.calle} {formData.direccionEnvio.numero}
                      {formData.direccionEnvio.departamento && `, ${formData.direccionEnvio.departamento}`}
                      <br />
                      {formData.direccionEnvio.comuna}, {formData.direccionEnvio.ciudad}
                      <br />
                      {formData.direccionEnvio.region}
                      {formData.direccionEnvio.codigoPostal && `, ${formData.direccionEnvio.codigoPostal}`}
                    </p>
                    {formData.direccionEnvio.instrucciones && (
                      <p className="text-gray-600 mt-2 text-sm">
                        <strong>Instrucciones:</strong> {formData.direccionEnvio.instrucciones}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-800 mb-2">Método de Pago</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700">
                      {formData.metodoPago === 'webpay' && 'WebPay - Tarjeta de crédito o débito'}
                      {formData.metodoPago === 'transferencia' && 'Transferencia Bancaria'}
                      {formData.metodoPago === 'efectivo' && 'Efectivo al recibir'}
                    </p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-800 mb-2">Productos</h3>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {cart.map((item) => (
                        <li key={item._id} className="p-4 flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={item.imagenUrl || '/placeholder-product.jpg'}
                              alt={item.nombre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{item.nombre}</p>
                            <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                            {hasDiscount(item) && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="line-through text-xs text-gray-500">{formatPrice(item.precio)}</span>
                                <span className="text-xs bg-green-100 text-green-800 py-0.5 px-1.5 rounded-full">
                                  {item.descuento || Math.round(((item.precio - getDiscountedPrice(item)) / item.precio) * 100)}% OFF
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${hasDiscount(item) ? 'text-green-600' : 'text-gray-800'}`}>
                              {formatPrice(getDiscountedPrice(item) * item.cantidad)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={etapaAnterior}
                    className="py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full shadow-md transition-all duration-300 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-3 px-8 bg-[#FFD15C] hover:bg-[#FFC132] text-white font-bold rounded-full shadow-md transition-all duration-300 flex items-center gap-2"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </span>
                    ) : (
                      <>
                        Confirmar Pedido
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-lg rounded-2xl p-8 sticky top-6 animate-fadeIn">
            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Resumen del pedido
            </h2>
            
            <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-2">
              {cart.map(item => (
                <div key={item._id} className="flex items-center gap-3 py-2 border-b border-gray-100">
                  <div className="h-12 w-12 flex-shrink-0 rounded-md bg-gray-100 overflow-hidden">
                    <img
                      src={item.imagenUrl || '/placeholder-product.jpg'}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {item.cantidad} × {formatPrice(getDiscountedPrice(item))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">
                      {formatPrice(getDiscountedPrice(item) * item.cantidad)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(totales.subtotalConDescuentos)}</span>
              </div>
              
              {totales.ahorroTotal > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Ahorro total</span>
                  <span className="font-medium">-{formatPrice(totales.ahorroTotal)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Envío</span>
                {totales.costoEnvio === 0 ? (
                  <span className="font-medium text-green-600">GRATIS</span>
                ) : (
                  <span className="font-medium">{formatPrice(totales.costoEnvio)}</span>
                )}
              </div>
              
              {totales.costoEnvio > 0 && (
                <div className="text-xs text-gray-500">
                  Te faltan <span className="font-semibold">{formatPrice(30000 - totales.subtotalConDescuentos)}</span> para envío gratis
                </div>
              )}
              
              <div className="h-px bg-gray-200 my-3"></div>
              
              <div className="flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="font-extrabold text-2xl text-[#FFD15C]">{formatPrice(totales.totalFinal)}</span>
              </div>
            </div>
            
            {/* Fecha estimada de entrega */}
            <div className="bg-[#FFF9E6] rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#FFD15C] p-2">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Entrega estimada</p>
                  <p className="text-sm text-gray-600">
                    {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Políticas */}
            <div className="text-xs text-gray-500 space-y-2">
              <p className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Pago 100% seguro
              </p>
              <p className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                </svg>
                Garantía de satisfacción
              </p>
              <p className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Precios justos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos globales para los botones (agregar al CSS global)
const globalStyles = `
  .btn-primary {
    @apply py-3 px-6 bg-[#FFD15C] hover:bg-[#FFC132] text-white font-bold rounded-full shadow-md transition-all duration-300;
  }
  
  .btn-secondary {
    @apply py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full shadow-md transition-all duration-300;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default Checkout;
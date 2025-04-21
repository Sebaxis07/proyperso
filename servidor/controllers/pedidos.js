// servidor/controllers/pedidos.js
import Pedido from '../models/Pedido.js';
import Producto from '../models/Producto.js';

// @desc    Crear nuevo pedido
// @route   POST /api/pedidos
// @access  Private
export async function crearPedido(req, res) {
  try {
    const { productos, direccionEnvio, metodoPago } = req.body;

    // Añadir logs para debugging
    console.log('Datos recibidos:', { productos, direccionEnvio, metodoPago });
    console.log('Usuario:', req.usuario);

    if (!productos || productos.length === 0) {
      return res.status(400).json({ msg: 'No hay productos en el pedido' });
    }

    // Verificar stock y calcular totales
    let subtotal = 0;
    const productosConDetalles = [];

    for (const item of productos) {
      const producto = await Producto.findById(item.producto);

      if (!producto) {
        return res.status(404).json({ 
          msg: `Producto con ID ${item.producto} no encontrado`,
          error: true
        });
      }

      if (producto.stock < item.cantidad) {
        return res.status(400).json({ 
          msg: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
          error: true
        });
      }

      const precioUnitario = producto.enOferta 
        ? producto.precio * (1 - producto.descuento / 100) 
        : producto.precio;
      
      const subtotalItem = precioUnitario * item.cantidad;
      subtotal += subtotalItem;

      productosConDetalles.push({
        producto: item.producto,
        cantidad: item.cantidad,
        precioUnitario,
        subtotal: subtotalItem
      });
    }

    // Calcular costo de envío
    const costoEnvio = subtotal > 30000 ? 0 : 3990;
    const total = subtotal + costoEnvio;

    // Crear nuevo pedido
    const nuevoPedido = new Pedido({
      usuario: req.usuario.id,
      productos: productosConDetalles,
      direccionEnvio,
      metodoPago,
      subtotal,
      costoEnvio,
      total,
      estadoPedido: 'pendiente',
      estadoPago: metodoPago === 'transferencia' ? 'pendiente' : 'pagado'
    });

    // Actualizar stock después de confirmar que todo está bien
    for (const item of productos) {
      const producto = await Producto.findById(item.producto);
      producto.stock -= item.cantidad;
      await producto.save();
    }

    await nuevoPedido.save();

    res.status(201).json({
      success: true,
      data: nuevoPedido
    });

  } catch (err) {
    console.error('Error completo:', err);
    return res.status(500).json({ 
      msg: 'Error en el servidor',
      error: err.message 
    });
  }
}


// @desc    Obtener cantidad de pedidos del usuario
// @route   GET /api/pedidos/count
// @access  Private
export const getPedidosCount = async (req, res) => {
  try {
    // Obtener el ID del usuario desde el token JWT (asumiendo que usas middleware de autenticación)
    const userId = req.usuario.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado, token no válido'
      });
    }

    // Contar pedidos del usuario
    const count = await Pedido.countDocuments({ usuario: userId });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error al obtener conteo de pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener conteo de pedidos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// @desc    Obtener todos los pedidos del usuario
// @route   GET /api/pedidos
// @access  Private
export async function getPedidos(req, res) {
  try {
    const pedidos = await Pedido.find({ usuario: req.usuario.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pedidos.length,
      data: pedidos
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}

// @desc    Obtener un pedido por ID
// @route   GET /api/pedidos/:id
// @access  Private
export async function getPedido(req, res) {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('productos.producto', 'nombre imagenUrl');

    if (!pedido) {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }

    // Asegurar que el usuario solo vea sus propios pedidos (a menos que sea admin)
    if (pedido.usuario.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    res.json({
      success: true,
      data: pedido
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}

// @desc    Subir comprobante de pago
// @route   PUT /api/pedidos/:id/comprobante
// @access  Private
export async function subirComprobante(req, res) {
  try {
    const { urlComprobante } = req.body;

    if (!urlComprobante) {
      return res.status(400).json({ msg: 'Debe proporcionar la URL del comprobante' });
    }

    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }

    // Verificar que sea el dueño del pedido
    if (pedido.usuario.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    pedido.comprobantePago = urlComprobante;
    pedido.estadoPago = 'pendiente'; // Cambiar a pendiente de verificación

    await pedido.save();

    res.json({
      success: true,
      data: pedido
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}

// @desc    Actualizar estado de pedido (sólo admin)
// @route   PUT /api/pedidos/:id/estado
// @access  Private/Admin
export async function actualizarEstadoPedido(req, res) {
  try {
    const { estadoPedido, estadoPago } = req.body;

    // Validar estados
    const estadosPermitidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    const estadosPagoPermitidos = ['pendiente', 'pagado', 'rechazado'];

    if (estadoPedido && !estadosPermitidos.includes(estadoPedido)) {
      return res.status(400).json({ msg: 'Estado de pedido inválido' });
    }

    if (estadoPago && !estadosPagoPermitidos.includes(estadoPago)) {
      return res.status(400).json({ msg: 'Estado de pago inválido' });
    }

    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }

    // Actualizar campos
    if (estadoPedido) {
      pedido.estadoPedido = estadoPedido;
    }
    
    if (estadoPago) {
      pedido.estadoPago = estadoPago;
    }

    await pedido.save();

    res.json({
      success: true,
      data: pedido
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}

// @desc    Obtener todos los pedidos (solo admin)
// @route   GET /api/pedidos/admin/todos
// @access  Private/Admin
export const getPedidosAdmin = async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate('usuario', 'nombre email')
      .populate('productos.producto', 'nombre precio') // <-- Cambiado de 'items' a 'productos'
      .sort({ createdAt: -1 }); // <-- Asegúrate de que este campo existe en tu esquema
    
    res.json({
      success: true,
      count: pedidos.length,
      data: pedidos
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos',
      error: error.message
    });
  }
};

// @desc    Cancelar pedido
// @route   PUT /api/pedidos/:id/cancelar
// @access  Private
export async function cancelarPedido(req, res) {
  try {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }

    // Verificar que sea el dueño del pedido
    if (pedido.usuario.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(401).json({ msg: 'No autorizado' });
    }

    // Solo se pueden cancelar pedidos pendientes o procesando
    if (!['pendiente', 'procesando'].includes(pedido.estadoPedido)) {
      return res.status(400).json({ msg: 'No se puede cancelar un pedido que ya ha sido enviado o entregado' });
    }

    // Devolver stock a los productos
    for (const item of pedido.productos) {
      const producto = await Producto.findById(item.producto);
      if (producto) {
        producto.stock += item.cantidad;
        await producto.save();
      }
    }

    pedido.estadoPedido = 'cancelado';
    await pedido.save();

    res.json({
      success: true,
      data: pedido
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}

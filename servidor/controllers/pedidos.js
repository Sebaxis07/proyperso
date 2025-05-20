// servidor/controllers/pedidos.js
import Pedido from '../models/Pedido.js';
import Producto from '../models/Producto.js';
import mongoose from 'mongoose';

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
      .populate('productos.producto', 'nombre imagenUrl categorias')
      .populate('procesadoPor', 'nombre apellido');

    if (!pedido) {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }

    // Asegurar que el usuario solo vea sus propios pedidos (a menos que sea admin o empleado)
    if (pedido.usuario.toString() !== req.usuario.id && 
        !['admin', 'empleado'].includes(req.usuario.rol)) {
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

// @desc    Actualizar estado de pedido (solo admin y empleados)
// @route   PUT /api/pedidos/:id/estado
// @access  Private/Admin/Empleado
export async function actualizarEstadoPedido(req, res) {
  try {
    const { estadoPedido, estadoPago, notasInternas } = req.body;

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

    // Verificar restricciones para empleados
    if (req.usuario.rol === 'empleado') {
      // Los empleados no pueden cambiar el estado de pago
      if (estadoPago) {
        return res.status(403).json({ 
          msg: 'Los empleados no pueden cambiar el estado de pago' 
        });
      }
      
      // Los empleados no pueden cancelar pedidos ya enviados
      if (estadoPedido === 'cancelado' && 
          ['enviado', 'entregado'].includes(pedido.estadoPedido)) {
        return res.status(403).json({ 
          msg: 'No se puede cancelar un pedido que ya ha sido enviado o entregado' 
        });
      }
    }

    // Registrar quién procesa el pedido (para auditoría)
    if (estadoPedido === 'procesando' && pedido.estadoPedido === 'pendiente') {
      pedido.procesadoPor = req.usuario.id;
    }

    // Actualizar campos
    if (estadoPedido) {
      pedido.estadoPedido = estadoPedido;
      
      // Si el estado cambia a "enviado", crear un evento en el historial
      if (estadoPedido === 'enviado' && !pedido.seguimiento) {
        const fechaEnvio = new Date();
        pedido.seguimiento = {
          numeroSeguimiento: 'SP' + Math.floor(Math.random() * 10000000),
          empresa: 'Starken',
          fechaEnvio,
          urlSeguimiento: 'https://www.starken.cl/seguimiento',
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          historia: [
            { fecha: fechaEnvio, estado: 'Pedido enviado' }
          ]
        };
      }
    }
    
    if (estadoPago) {
      pedido.estadoPago = estadoPago;
    }
    
    if (notasInternas) {
      pedido.notasInternas = notasInternas;
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

// @desc    Obtener todos los pedidos (solo admin y empleados)
// @route   GET /api/pedidos/admin/todos
// @access  Private/Admin/Empleado
export const getPedidosAdmin = async (req, res) => {
  try {
    // Filtros opcionales
    const { estado, fechaDesde, fechaHasta, buscar } = req.query;
    
    let filtro = {};
    
    // Aplicar filtros si existen
    if (estado && estado !== 'todos') {
      filtro.estadoPedido = estado;
    }
    
    if (fechaDesde || fechaHasta) {
      filtro.createdAt = {};
      
      if (fechaDesde) {
        filtro.createdAt.$gte = new Date(fechaDesde);
      }
      
      if (fechaHasta) {
        filtro.createdAt.$lte = new Date(fechaHasta);
      }
    }
    
    if (buscar) {
      // Buscar por número de pedido o nombre/email de usuario
      filtro.$or = [
        { numeroPedido: { $regex: buscar, $options: 'i' } }
      ];
    }
    
    // Los empleados pueden ver todos los pedidos para procesarlos,
    // pero no pueden modificar productos ni categorías
    const pedidos = await Pedido.find(filtro)
      .populate('usuario', 'nombre email')
      .populate('productos.producto', 'nombre precio imagenUrl')
      .populate('procesadoPor', 'nombre apellido')
      .sort({ createdAt: -1 });
    
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

// @desc    Pedidos pendientes por procesar (dashboard)
// @route   GET /api/pedidos/pendientes
// @access  Private/Admin/Empleado
export const getPedidosPendientes = async (req, res) => {
  try {
    const pedidosPendientes = await Pedido.countDocuments({ estadoPedido: 'pendiente' });
    const pedidosProcesando = await Pedido.countDocuments({ estadoPedido: 'procesando' });
    const pedidosEnviados = await Pedido.countDocuments({ estadoPedido: 'enviado' });
    const pedidosEntregados = await Pedido.countDocuments({ estadoPedido: 'entregado' });
    
    res.json({
      success: true,
      data: {
        pendientes: pedidosPendientes,
        procesando: pedidosProcesando,
        enviados: pedidosEnviados,
        entregados: pedidosEntregados
      }
    });
  } catch (error) {
    console.error('Error al obtener conteo de pedidos pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener conteo de pedidos pendientes',
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

    // Verificar que sea el dueño del pedido o admin
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

// @desc    Asignar pedido a empleado
// @route   PUT /api/pedidos/:id/asignar
// @access  Private/Admin/Empleado
export const asignarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }
    
    // Verificar que el pedido esté pendiente o en proceso
    if (!['pendiente', 'procesando'].includes(pedido.estadoPedido)) {
      return res.status(400).json({ 
        msg: 'No se puede asignar un pedido que ya ha sido enviado, entregado o cancelado' 
      });
    }
    
    // Asignar el pedido al empleado actual
    pedido.procesadoPor = req.usuario.id;
    
    // Si todavía está pendiente, cambiar a procesando
    if (pedido.estadoPedido === 'pendiente') {
      pedido.estadoPedido = 'procesando';
    }
    
    await pedido.save();
    
    res.json({
      success: true,
      data: pedido
    });
  } catch (err) {
    console.error('Error al asignar pedido:', err);
    res.status(500).json({
      success: false,
      msg: 'Error al asignar pedido',
      error: err.message
    });
  }
}

// @desc    Obtener estadísticas de pedidos (dashboard)
// @route   GET /api/pedidos/stats
// @access  Private/Admin/Empleado
export const getPedidosStats = async (req, res) => {
  try {
    console.log('Obteniendo estadísticas de pedidos...');

    console.log('Contando pedidos pendientes...');
    const pedidosPendientes = await Pedido.countDocuments({ estadoPedido: 'pendiente' });
    console.log(`Pedidos pendientes: ${pedidosPendientes}`);

    console.log('Contando pedidos en proceso...');
    const pedidosProcesando = await Pedido.countDocuments({ estadoPedido: 'procesando' });
    console.log(`Pedidos en proceso: ${pedidosProcesando}`);

    console.log('Contando pedidos enviados...');
    const pedidosEnviados = await Pedido.countDocuments({ estadoPedido: 'enviado' });
    console.log(`Pedidos enviados: ${pedidosEnviados}`);

    console.log('Contando pedidos entregados...');
    const pedidosEntregados = await Pedido.countDocuments({ estadoPedido: 'entregado' });
    console.log(`Pedidos entregados: ${pedidosEntregados}`);

    // Manejo de valores por defecto en caso de que la respuesta no tenga el formato esperado
    const stats = {
      pendientes: pedidosPendientes || 0,
      procesando: pedidosProcesando || 0,
      enviados: pedidosEnviados || 0,
      entregados: pedidosEntregados || 0
    };
    
    console.log('Estadísticas de pedidos:', stats);

    res.json({
      success: true,
      data: stats
    });
    console.log('Estadísticas de pedidos enviadas con éxito');
  } catch (error) {
    console.error('Error al obtener estadísticas de pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de pedidos',
      error: error.message
    });
  }
};

// @desc    Obtener pedidos recientes (dashboard)
// @route   GET /api/pedidos/recientes
// @access  Private/Admin/Empleado
export const getPedidosRecientes = async (req, res) => {
  try {
    const pedidosRecientes = await Pedido.find()
      .sort({ createdAt: -1 })
      .limit(5) // Limitar a los 5 pedidos más recientes
      .populate('usuario', 'nombre email')
      .populate('productos.producto', 'nombre precio imagenUrl');

    res.json({
      success: true,
      data: pedidosRecientes
    });
  } catch (error) {
    console.error('Error al obtener pedidos recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos recientes',
      error: error.message
    });
  }
};
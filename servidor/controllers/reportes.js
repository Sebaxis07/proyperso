// controllers/reportes.js
import Pedido from '../models/pedido.js';
import Usuario from '../models/Usuario.js';
import Producto from '../models/producto.js';

// @desc    Obtener reporte mensual completo
// @route   GET /api/reportes/mensual
// @access  Admin
export const getReporteMensual = async (req, res) => {
  try {
    // Obtener mes y año de los query params o usar el mes actual
    const { mes, anio } = req.query;
    const fechaReporte = new Date();
    
    // Si se especifican mes y año, usarlos
    if (mes && anio) {
      fechaReporte.setMonth(parseInt(mes) - 1); // Restar 1 porque los meses en JS van de 0-11
      fechaReporte.setFullYear(parseInt(anio));
    }
    
    const mesReporte = fechaReporte.getMonth();
    const anioReporte = fechaReporte.getFullYear();
    
    // Calcular fechas de inicio y fin del mes
    const fechaInicio = new Date(anioReporte, mesReporte, 1);
    const fechaFin = new Date(anioReporte, mesReporte + 1, 0, 23, 59, 59); // Último día del mes
    
    // Calcular fechas para el mes anterior (para comparativas)
    const mesAnterior = mesReporte === 0 ? 11 : mesReporte - 1;
    const anioMesAnterior = mesReporte === 0 ? anioReporte - 1 : anioReporte;
    const fechaInicioMesAnterior = new Date(anioMesAnterior, mesAnterior, 1);
    const fechaFinMesAnterior = new Date(anioMesAnterior, mesAnterior + 1, 0, 23, 59, 59);
    
    // 1. Obtener todos los pedidos del mes
    const pedidosMes = await Pedido.find({
      createdAt: { $gte: fechaInicio, $lte: fechaFin }
    })
    .populate('usuario', 'nombre email')
    .populate('productos.producto', 'nombre precio imagenUrl');
    
    // 2. Obtener pedidos del mes anterior (para comparativas)
    const pedidosMesAnterior = await Pedido.find({
      createdAt: { $gte: fechaInicioMesAnterior, $lte: fechaFinMesAnterior }
    });
    
    // 3. Obtener usuarios nuevos del mes
    const usuariosNuevosMes = await Usuario.countDocuments({
      createdAt: { $gte: fechaInicio, $lte: fechaFin }
    });
    
    // 4. Calcular métricas generales
    const ventasMes = pedidosMes.reduce((total, pedido) => total + (pedido.total || 0), 0);
    const ventasMesAnterior = pedidosMesAnterior.reduce((total, pedido) => total + (pedido.total || 0), 0);
    const cantidadPedidos = pedidosMes.length;
    const ticketPromedio = cantidadPedidos > 0 ? ventasMes / cantidadPedidos : 0;
    
    // Calcular variación porcentual respecto al mes anterior
    let variacionVentas = 0;
    if (ventasMesAnterior > 0) {
      variacionVentas = ((ventasMes - ventasMesAnterior) / ventasMesAnterior) * 100;
    }
    
    // 5. Calcular ventas por día del mes
    const ventasPorDia = {};
    const diasDelMes = fechaFin.getDate();
    
    // Inicializar todos los días del mes
    for (let i = 1; i <= diasDelMes; i++) {
      ventasPorDia[i] = { ventas: 0, pedidos: 0 };
    }
    
    // Agrupar ventas por día
    pedidosMes.forEach(pedido => {
      const dia = new Date(pedido.createdAt).getDate();
      ventasPorDia[dia].ventas += pedido.total || 0;
      ventasPorDia[dia].pedidos += 1;
    });
    
    // Convertir a formato para gráficos
    const dataVentasDiarias = Object.entries(ventasPorDia).map(([dia, datos]) => ({
      dia: parseInt(dia),
      ventas: datos.ventas,
      pedidos: datos.pedidos
    }));
    
    // 6. Calcular productos más vendidos
    const productosMasVendidos = {};
    
    pedidosMes.forEach(pedido => {
      if (pedido.productos && Array.isArray(pedido.productos)) {
        pedido.productos.forEach(item => {
          const productoId = item.producto?._id || item.producto;
          const nombre = item.producto?.nombre || 'Producto';
          const cantidad = item.cantidad || 1;
          const precio = item.precio || 0;
          
          if (!productosMasVendidos[productoId]) {
            productosMasVendidos[productoId] = {
              nombre,
              cantidad: 0,
              ingresos: 0
            };
          }
          
          productosMasVendidos[productoId].cantidad += cantidad;
          productosMasVendidos[productoId].ingresos += precio * cantidad;
        });
      }
    });
    
    // Convertir a array y ordenar por cantidad
    const topProductos = Object.values(productosMasVendidos)
      .sort((a, b) => b.cantidad - a.cantidad);
    
    // 7. Calcular distribución por estado de pedido
    const pedidosPorEstado = {
      pendiente: 0,
      pagado: 0,
      enviado: 0,
      entregado: 0,
      cancelado: 0
    };
    
    pedidosMes.forEach(pedido => {
      const estado = pedido.estadoPedido || 'pendiente';
      if (pedidosPorEstado.hasOwnProperty(estado)) {
        pedidosPorEstado[estado] += 1;
      }
    });
    
    // Convertir a formato para gráficos
    const dataEstadoPedidos = Object.entries(pedidosPorEstado).map(([estado, cantidad]) => ({
      estado,
      cantidad
    }));
    
    // 8. Métodos de pago utilizados
    const metodosPago = {};
    
    pedidosMes.forEach(pedido => {
      const metodo = pedido.metodoPago || 'No especificado';
      
      if (!metodosPago[metodo]) {
        metodosPago[metodo] = {
          metodo,
          cantidad: 0,
          total: 0
        };
      }
      
      metodosPago[metodo].cantidad += 1;
      metodosPago[metodo].total += pedido.total || 0;
    });
    
    const dataMetodosPago = Object.values(metodosPago);
    
    // Preparar respuesta con todos los datos del reporte
    const reporte = {
      periodo: {
        mes: mesReporte + 1, // Sumar 1 para formato común (1-12)
        anio: anioReporte,
        nombreMes: fechaInicio.toLocaleString('es', { month: 'long' })
      },
      metricas: {
        ventasTotales: ventasMes,
        cantidadPedidos,
        ticketPromedio,
        usuariosNuevos: usuariosNuevosMes,
        comparacionMesAnterior: {
          ventasMesAnterior,
          variacionPorcentual: variacionVentas
        }
      },
      graficos: {
        ventasDiarias: dataVentasDiarias,
        productosMasVendidos: topProductos,
        estadoPedidos: dataEstadoPedidos,
        metodosPago: dataMetodosPago
      },
      detallePedidos: pedidosMes.map(pedido => ({
        id: pedido._id,
        fecha: pedido.createdAt,
        cliente: pedido.usuario ? `${pedido.usuario.nombre} (${pedido.usuario.email})` : 'Cliente',
        total: pedido.total,
        estado: pedido.estadoPedido,
        metodoPago: pedido.metodoPago
      }))
    };
    
    res.json({
      success: true,
      data: reporte
    });
    
  } catch (error) {
    console.error('Error al generar reporte mensual:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte mensual',
      error: error.message
    });
  }
};

// @desc    Obtener ventas por periodo (día, semana, mes, año)
// @route   GET /api/reportes/ventas-por-periodo
// @access  Admin
export const getReporteVentas = async (req, res) => {
  try {
    const { periodo, fechaInicio, fechaFin } = req.query;
    
    // Validar parámetros
    if (!periodo) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere especificar un periodo (dia, semana, mes, anio)'
      });
    }
    
    // Calcular fechas de inicio y fin según el periodo
    let inicio, fin;
    const ahora = new Date();
    
    if (fechaInicio && fechaFin) {
      // Si se proporcionan fechas específicas
      inicio = new Date(fechaInicio);
      fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
    } else {
      // Configurar fechas según el periodo seleccionado
      switch (periodo) {
        case 'dia':
          inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0);
          fin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);
          break;
        case 'semana':
          const diaSemana = ahora.getDay(); // 0 = domingo, 6 = sábado
          const diferenciaDias = diaSemana === 0 ? 6 : diaSemana - 1; // Lunes como primer día
          inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - diferenciaDias, 0, 0, 0);
          fin = new Date(inicio);
          fin.setDate(fin.getDate() + 6);
          fin.setHours(23, 59, 59, 999);
          break;
        case 'mes':
          inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0);
          fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
          break;
        case 'anio':
          inicio = new Date(ahora.getFullYear(), 0, 1, 0, 0, 0);
          fin = new Date(ahora.getFullYear(), 11, 31, 23, 59, 59);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Periodo no válido. Use: dia, semana, mes, anio'
          });
      }
    }
    
    // Obtener pedidos en el rango de fechas
    const pedidos = await Pedido.find({
      createdAt: { $gte: inicio, $lte: fin }
    }).sort({ createdAt: 1 });
    
    // Calcular ventas totales
    const ventasTotales = pedidos.reduce((total, pedido) => total + (pedido.total || 0), 0);
    
    // Procesar datos según el periodo para gráficas
    let datosAgrupados = [];
    
    if (periodo === 'dia') {
      // Agrupar por hora
      const ventasPorHora = Array(24).fill().map((_, i) => ({
        hora: i,
        ventas: 0,
        pedidos: 0
      }));
      
      pedidos.forEach(pedido => {
        const hora = new Date(pedido.createdAt).getHours();
        ventasPorHora[hora].ventas += pedido.total || 0;
        ventasPorHora[hora].pedidos += 1;
      });
      
      datosAgrupados = ventasPorHora;
    } else if (periodo === 'semana') {
      // Agrupar por día de la semana
      const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const ventasPorDia = diasSemana.map(dia => ({
        dia,
        ventas: 0,
        pedidos: 0
      }));
      
      pedidos.forEach(pedido => {
        const fecha = new Date(pedido.createdAt);
        // getDay() retorna 0 para domingo, 6 para sábado
        // Ajustar para que lunes sea 0, domingo sea 6
        const diaSemana = fecha.getDay() === 0 ? 6 : fecha.getDay() - 1;
        
        ventasPorDia[diaSemana].ventas += pedido.total || 0;
        ventasPorDia[diaSemana].pedidos += 1;
      });
      
      datosAgrupados = ventasPorDia;
    } else if (periodo === 'mes') {
      // Agrupar por día del mes
      const diasMes = fin.getDate();
      const ventasPorDia = Array(diasMes).fill().map((_, i) => ({
        dia: i + 1,
        ventas: 0,
        pedidos: 0
      }));
      
      pedidos.forEach(pedido => {
        const dia = new Date(pedido.createdAt).getDate() - 1; // Restar 1 para índice de array (0-based)
        ventasPorDia[dia].ventas += pedido.total || 0;
        ventasPorDia[dia].pedidos += 1;
      });
      
      datosAgrupados = ventasPorDia;
    } else if (periodo === 'anio') {
      // Agrupar por mes
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const ventasPorMes = meses.map((mes, index) => ({
        mes,
        ventas: 0,
        pedidos: 0,
        indice: index
      }));
      
      pedidos.forEach(pedido => {
        const mes = new Date(pedido.createdAt).getMonth();
        ventasPorMes[mes].ventas += pedido.total || 0;
        ventasPorMes[mes].pedidos += 1;
      });
      
      datosAgrupados = ventasPorMes;
    }
    
    res.json({
      success: true,
      data: {
        periodo,
        fechaInicio: inicio,
        fechaFin: fin,
        ventasTotales,
        cantidadPedidos: pedidos.length,
        datosAgrupados
      }
    });
    
  } catch (error) {
    console.error('Error al generar reporte de ventas por periodo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte de ventas',
      error: error.message
    });
  }
};

// @desc    Obtener reportes de productos
// @route   GET /api/reportes/productos
// @access  Admin
export const getReporteProductos = async (req, res) => {
  try {
    let fechaInicio, fechaFin;
    const ahora = new Date();
    
    // Configurar periodo de tiempo para el reporte
    if (req.query.fechaInicio && req.query.fechaFin) {
      fechaInicio = new Date(req.query.fechaInicio);
      fechaFin = new Date(req.query.fechaFin);
      fechaFin.setHours(23, 59, 59, 999);
    } else {
      // Por defecto, reporte del mes actual
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    }
    
    // Obtener pedidos en el rango de fechas
    const pedidos = await Pedido.find({
      createdAt: { $gte: fechaInicio, $lte: fechaFin }
    }).populate('productos.producto', 'nombre precio categoria stock imagenUrl');
    
    // Procesar datos de productos
    const productosVendidos = {};
    
    pedidos.forEach(pedido => {
      if (pedido.productos && Array.isArray(pedido.productos)) {
        pedido.productos.forEach(item => {
          const productoId = item.producto?._id || item.producto;
          
          if (!productoId) return;
          
          if (!productosVendidos[productoId]) {
            productosVendidos[productoId] = {
              id: productoId,
              nombre: item.producto?.nombre || 'Producto',
              categoria: item.producto?.categoria || 'Sin categoría',
              precio: item.producto?.precio || item.precio || 0,
              stock: item.producto?.stock || 0,
              cantidad: 0,
              ingresos: 0,
              aparicionesEnPedidos: 0
            };
          }
          
          productosVendidos[productoId].cantidad += item.cantidad || 1;
          productosVendidos[productoId].ingresos += (item.precio || productosVendidos[productoId].precio) * (item.cantidad || 1);
          productosVendidos[productoId].aparicionesEnPedidos += 1;
        });
      }
    });
    
    // Convertir a array y calcular datos adicionales
    let listaProductos = Object.values(productosVendidos);
    
    // Calcular popularidad (apariciones / total de pedidos)
    const totalPedidos = pedidos.length;
    listaProductos = listaProductos.map(producto => ({
      ...producto,
      popularidad: totalPedidos > 0 ? (producto.aparicionesEnPedidos / totalPedidos) * 100 : 0
    }));
    
    // Ordenar por cantidad vendida
    listaProductos.sort((a, b) => b.cantidad - a.cantidad);
    
    // Agrupar por categoría
    const ventasPorCategoria = {};
    
    listaProductos.forEach(producto => {
      const categoria = producto.categoria;
      
      if (!ventasPorCategoria[categoria]) {
        ventasPorCategoria[categoria] = {
          categoria,
          cantidad: 0,
          ingresos: 0
        };
      }
      
      ventasPorCategoria[categoria].cantidad += producto.cantidad;
      ventasPorCategoria[categoria].ingresos += producto.ingresos;
    });
    
    // Convertir a array y ordenar por ingresos
    const categorias = Object.values(ventasPorCategoria).sort((a, b) => b.ingresos - a.ingresos);
    
    res.json({
      success: true,
      data: {
        periodo: {
          fechaInicio,
          fechaFin
        },
        resumen: {
          totalProductosVendidos: listaProductos.reduce((sum, p) => sum + p.cantidad, 0),
          ingresosGenerados: listaProductos.reduce((sum, p) => sum + p.ingresos, 0),
          productosDistintos: listaProductos.length
        },
        productos: listaProductos,
        categorias
      }
    });
    
  } catch (error) {
    console.error('Error al generar reporte de productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte de productos',
      error: error.message
    });
  }
};

// @desc    Obtener reportes de clientes
// @route   GET /api/reportes/clientes
// @access  Admin
export const getReporteClientes = async (req, res) => {
  try {
    let fechaInicio, fechaFin;
    const ahora = new Date();
    
    // Configurar periodo de tiempo para el reporte
    if (req.query.fechaInicio && req.query.fechaFin) {
      fechaInicio = new Date(req.query.fechaInicio);
      fechaFin = new Date(req.query.fechaFin);
      fechaFin.setHours(23, 59, 59, 999);
    } else {
      // Por defecto, reporte del mes actual
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    }
    
    // Obtener pedidos en el rango de fechas con información de usuarios
    const pedidos = await Pedido.find({
      createdAt: { $gte: fechaInicio, $lte: fechaFin }
    }).populate('usuario', 'nombre email createdAt');
    
    // Obtener nuevos usuarios en el rango de fechas
    const nuevosUsuarios = await Usuario.find({
      createdAt: { $gte: fechaInicio, $lte: fechaFin }
    }).countDocuments();
    
    // Procesar datos de clientes
    const clientesActivos = {};
    
    pedidos.forEach(pedido => {
      if (!pedido.usuario || !pedido.usuario._id) return;
      
      const clienteId = pedido.usuario._id.toString();
      
      if (!clientesActivos[clienteId]) {
        clientesActivos[clienteId] = {
          id: clienteId,
          nombre: pedido.usuario.nombre || 'Cliente',
          email: pedido.usuario.email || '',
          fechaRegistro: pedido.usuario.createdAt,
          pedidos: 0,
          gasto: 0,
          ultimaCompra: null
        };
      }
      
      clientesActivos[clienteId].pedidos += 1;
      clientesActivos[clienteId].gasto += pedido.total || 0;
      
      // Actualizar fecha de última compra
      const fechaPedido = new Date(pedido.createdAt);
      if (!clientesActivos[clienteId].ultimaCompra || fechaPedido > clientesActivos[clienteId].ultimaCompra) {
        clientesActivos[clienteId].ultimaCompra = fechaPedido;
      }
    });
    
    // Convertir a array y calcular datos adicionales
    let listaClientes = Object.values(clientesActivos);
    
    // Calcular ticket promedio por cliente
    listaClientes = listaClientes.map(cliente => ({
      ...cliente,
      ticketPromedio: cliente.pedidos > 0 ? cliente.gasto / cliente.pedidos : 0,
      // Calcular si es cliente nuevo (se registró en el periodo)
      esNuevo: cliente.fechaRegistro >= fechaInicio && cliente.fechaRegistro <= fechaFin
    }));
    
    // Ordenar por gasto total
    listaClientes.sort((a, b) => b.gasto - a.gasto);
    
    // Calcular distribución de clientes nuevos vs recurrentes
    const clientesNuevos = listaClientes.filter(c => c.esNuevo).length;
    const clientesRecurrentes = listaClientes.length - clientesNuevos;
    
    res.json({
      success: true,
      data: {
        periodo: {
          fechaInicio,
          fechaFin
        },
        resumen: {
          totalClientes: listaClientes.length,
          nuevosRegistros: nuevosUsuarios,
          clientesActivos: listaClientes.length,
          gastoPromedio: listaClientes.reduce((sum, c) => sum + c.gasto, 0) / listaClientes.length || 0
        },
        distribucion: {
          nuevos: clientesNuevos,
          recurrentes: clientesRecurrentes
        },
        clientes: listaClientes
      }
    });
    
  } catch (error) {
    console.error('Error al generar reporte de clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte de clientes',
      error: error.message
    });
  }
};
import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Pedido from '../models/Pedido.js';
import Usuario from '../models/Usuario.js';
import Producto from '../models/Producto.js';
import exceljs from 'exceljs';

const router = Router();
const { Workbook } = exceljs;

// Protect all routes in this router
router.use(protect, authorize('admin'));

/**
 * @route   GET /api/reportes/exportar/:tipo
 * @desc    Exporta un reporte a Excel
 * @access  Admin
 */
router.get('/exportar/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    const { mes, anio } = req.query;
    
    // Validar parámetros
    if (!mes || !anio) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere especificar mes y año'
      });
    }
    
    // Crear un nuevo libro de Excel
    const workbook = new Workbook();
    
    // Configurar propiedades del documento
    workbook.creator = 'Sistema de Administración';
    workbook.lastModifiedBy = 'Sistema de Administración';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Determinar tipo de reporte a exportar
    let datos;
    
    switch (tipo) {
      case 'mensual':
        datos = await generarReporteMensual(mes, anio, workbook);
        break;
      case 'ventas':
        datos = await generarReporteVentas(mes, anio, workbook);
        break;
      case 'productos':
        datos = await generarReporteProductos(mes, anio, workbook);
        break;
      case 'clientes':
        datos = await generarReporteClientes(mes, anio, workbook);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de reporte no válido'
        });
    }
    
    // Configurar headers para la descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_${tipo}_${anio}_${mes}.xlsx`);
    
    // Enviar el archivo
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error(`Error al exportar reporte a Excel: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error al exportar el reporte',
      error: error.message
    });
  }
});

/**
 * Genera el reporte mensual en Excel
 */
async function generarReporteMensual(mes, anio, workbook) {
  // Calcular fechas de inicio y fin del mes
  const fechaInicio = new Date(anio, mes - 1, 1);
  const fechaFin = new Date(anio, mes, 0, 23, 59, 59); // Último día del mes
  
  // Obtener datos del periodo
  const pedidos = await Pedido.find({
    fechaCreacion: { $gte: fechaInicio, $lte: fechaFin }
  })
  .populate('usuario', 'nombre email')
  .populate('items.producto', 'nombre precio');
  
  // Calcular mes anterior
  const mesAnterior = mes === 1 ? 12 : mes - 1;
  const anioMesAnterior = mes === 1 ? anio - 1 : anio;
  const fechaInicioMesAnterior = new Date(anioMesAnterior, mesAnterior - 1, 1);
  const fechaFinMesAnterior = new Date(anioMesAnterior, mesAnterior, 0, 23, 59, 59);
  
  // Obtener pedidos del mes anterior
  const pedidosMesAnterior = await Pedido.find({
    fechaCreacion: { $gte: fechaInicioMesAnterior, $lte: fechaFinMesAnterior }
  });
  
  // Calcular estadísticas básicas
  const ventasTotales = pedidos.reduce((sum, p) => sum + (p.precioTotal || 0), 0);
  const ventasMesAnterior = pedidosMesAnterior.reduce((sum, p) => sum + (p.precioTotal || 0), 0);
  
  // Crear hoja de resumen
  const worksheetResumen = workbook.addWorksheet('Resumen');
  
  // Configurar encabezado
  worksheetResumen.mergeCells('A1:F1');
  const tituloCell = worksheetResumen.getCell('A1');
  tituloCell.value = `REPORTE MENSUAL - ${fechaInicio.toLocaleString('es', { month: 'long' }).toUpperCase()} ${anio}`;
  tituloCell.font = { size: 16, bold: true };
  tituloCell.alignment = { horizontal: 'center' };
  
  // Métricas principales
  worksheetResumen.addRow(['']);
  worksheetResumen.addRow(['MÉTRICAS PRINCIPALES', '']);
  worksheetResumen.addRow(['Ventas Totales', `$${ventasTotales.toLocaleString()}`]);
  
  // Calcular variación
  let variacion = 0;
  if (ventasMesAnterior > 0) {
    variacion = ((ventasTotales - ventasMesAnterior) / ventasMesAnterior) * 100;
  }
  
  worksheetResumen.addRow(['Variación respecto al mes anterior', `${variacion.toFixed(2)}%`]);
  worksheetResumen.addRow(['Cantidad de Pedidos', pedidos.length]);
  worksheetResumen.addRow(['Ticket Promedio', `${(pedidos.length > 0 ? ventasTotales / pedidos.length : 0).toFixed(2)}`]);
  
  // Dar formato a la tabla de resumen
  worksheetResumen.getColumn('A').width = 30;
  worksheetResumen.getColumn('B').width = 20;
  
  // Agregar gráficos de ventas diarias
  worksheetResumen.addRow(['']);
  worksheetResumen.addRow(['VENTAS DIARIAS', '']);
  
  // Encabezados para ventas diarias
  worksheetResumen.addRow(['Día', 'Ventas', 'Cantidad de Pedidos']);
  
  // Calcular ventas por día
  const ventasPorDia = {};
  const diasDelMes = fechaFin.getDate();
  
  // Inicializar días
  for (let i = 1; i <= diasDelMes; i++) {
    ventasPorDia[i] = { ventas: 0, pedidos: 0 };
  }
  
  // Agrupar ventas por día
  pedidos.forEach(pedido => {
    const dia = new Date(pedido.fechaCreacion).getDate();
    ventasPorDia[dia].ventas += pedido.precioTotal || 0;
    ventasPorDia[dia].pedidos += 1;
  });
  
  // Agregar filas de ventas diarias
  Object.entries(ventasPorDia).forEach(([dia, datos]) => {
    worksheetResumen.addRow([
      parseInt(dia),
      datos.ventas,
      datos.pedidos
    ]);
  });
  
  // Crear hoja de productos más vendidos
  const worksheetProductos = workbook.addWorksheet('Productos Más Vendidos');
  
  // Configurar encabezado
  worksheetProductos.mergeCells('A1:D1');
  const tituloProductos = worksheetProductos.getCell('A1');
  tituloProductos.value = `PRODUCTOS MÁS VENDIDOS - ${fechaInicio.toLocaleString('es', { month: 'long' }).toUpperCase()} ${anio}`;
  tituloProductos.font = { size: 16, bold: true };
  tituloProductos.alignment = { horizontal: 'center' };
  
  // Encabezados para productos
  worksheetProductos.addRow(['']);
  worksheetProductos.addRow(['Producto', 'Cantidad Vendida', 'Precio Unitario', 'Total Generado']);
  
  // Procesar productos vendidos
  const productosVendidos = {};
  
  pedidos.forEach(pedido => {
    if (pedido.items && Array.isArray(pedido.items)) {
      pedido.items.forEach(item => {
        const productoId = item.producto?._id || item.productoId;
        const nombre = item.producto?.nombre || 'Producto';
        const cantidad = item.cantidad || 1;
        const precio = item.precio || 0;
        
        if (!productosVendidos[productoId]) {
          productosVendidos[productoId] = {
            nombre,
            cantidad: 0,
            precio,
            total: 0
          };
        }
        
        productosVendidos[productoId].cantidad += cantidad;
        productosVendidos[productoId].total += precio * cantidad;
      });
    }
  });
  
  // Convertir a array y ordenar por cantidad
  const topProductos = Object.values(productosVendidos)
    .sort((a, b) => b.cantidad - a.cantidad);
  
  // Agregar filas de productos
  topProductos.forEach(producto => {
    worksheetProductos.addRow([
      producto.nombre,
      producto.cantidad,
      producto.precio,
      producto.total
    ]);
  });
  
  // Dar formato a la tabla de productos
  worksheetProductos.getColumn('A').width = 40;
  worksheetProductos.getColumn('B').width = 15;
  worksheetProductos.getColumn('C').width = 15;
  worksheetProductos.getColumn('D').width = 15;
  
  // Crear hoja de detalle de pedidos
  const worksheetPedidos = workbook.addWorksheet('Detalle de Pedidos');
  
  // Configurar encabezado
  worksheetPedidos.mergeCells('A1:G1');
  const tituloPedidos = worksheetPedidos.getCell('A1');
  tituloPedidos.value = `DETALLE DE PEDIDOS - ${fechaInicio.toLocaleString('es', { month: 'long' }).toUpperCase()} ${anio}`;
  tituloPedidos.font = { size: 16, bold: true };
  tituloPedidos.alignment = { horizontal: 'center' };
  
  // Encabezados para pedidos
  worksheetPedidos.addRow(['']);
  worksheetPedidos.addRow(['ID Pedido', 'Fecha', 'Cliente', 'Email', 'Total', 'Estado', 'Método de Pago']);
  
  // Agregar filas de pedidos
  pedidos.forEach(pedido => {
    worksheetPedidos.addRow([
      pedido._id.toString(),
      new Date(pedido.fechaCreacion).toLocaleDateString(),
      pedido.usuario?.nombre || 'Cliente',
      pedido.usuario?.email || '',
      pedido.precioTotal || 0,
      pedido.estadoPedido || 'pendiente',
      pedido.metodoPago || 'No especificado'
    ]);
  });
  
  // Dar formato a la tabla de pedidos
  worksheetPedidos.getColumn('A').width = 25;
  worksheetPedidos.getColumn('B').width = 15;
  worksheetPedidos.getColumn('C').width = 25;
  worksheetPedidos.getColumn('D').width = 25;
  worksheetPedidos.getColumn('E').width = 15;
  worksheetPedidos.getColumn('F').width = 15;
  worksheetPedidos.getColumn('G').width = 20;
  
  return true;
}

/**
 * Genera el reporte de ventas en Excel
 */
async function generarReporteVentas(mes, anio, workbook) {
  // Implementación similar a generarReporteMensual pero enfocado en ventas
  // Esta es una versión simplificada para el ejemplo
  
  // Calcular fechas de inicio y fin del mes
  const fechaInicio = new Date(anio, mes - 1, 1);
  const fechaFin = new Date(anio, mes, 0, 23, 59, 59);
  
  // Obtener pedidos en el rango de fechas
  const pedidos = await Pedido.find({
    fechaCreacion: { $gte: fechaInicio, $lte: fechaFin }
  }).sort({ fechaCreacion: 1 });
  
  // Crear hoja de trabajo
  const worksheet = workbook.addWorksheet('Ventas');
  
  // Configurar encabezado
  worksheet.mergeCells('A1:E1');
  const tituloCell = worksheet.getCell('A1');
  tituloCell.value = `REPORTE DE VENTAS - ${fechaInicio.toLocaleString('es', { month: 'long' }).toUpperCase()} ${anio}`;
  tituloCell.font = { size: 16, bold: true };
  tituloCell.alignment = { horizontal: 'center' };
  
  // Encabezados para ventas diarias
  worksheet.addRow(['']);
  worksheet.addRow(['Día', 'Ventas Diarias', 'Cantidad de Pedidos', 'Ticket Promedio']);
  
  // Procesar ventas por día
  const ventasPorDia = {};
  const diasDelMes = fechaFin.getDate();
  
  // Inicializar días
  for (let i = 1; i <= diasDelMes; i++) {
    ventasPorDia[i] = { ventas: 0, pedidos: 0 };
  }
  
  // Agrupar ventas por día
  pedidos.forEach(pedido => {
    const dia = new Date(pedido.fechaCreacion).getDate();
    ventasPorDia[dia].ventas += pedido.precioTotal || 0;
    ventasPorDia[dia].pedidos += 1;
  });
  
  // Agregar filas de ventas diarias
  Object.entries(ventasPorDia).forEach(([dia, datos]) => {
    worksheet.addRow([
      parseInt(dia),
      datos.ventas,
      datos.pedidos,
      datos.pedidos > 0 ? datos.ventas / datos.pedidos : 0
    ]);
  });
  
  // Dar formato a la tabla
  worksheet.getColumn('A').width = 15;
  worksheet.getColumn('B').width = 15;
  worksheet.getColumn('C').width = 20;
  worksheet.getColumn('D').width = 15;
  
  return true;
}

/**
 * Genera el reporte de productos en Excel
 */
async function generarReporteProductos(mes, anio, workbook) {
  // Implementación para reporte de productos
  
  // Calcular fechas de inicio y fin del mes
  const fechaInicio = new Date(anio, mes - 1, 1);
  const fechaFin = new Date(anio, mes, 0, 23, 59, 59);
  
  // Obtener pedidos en el rango de fechas
  const pedidos = await Pedido.find({
    fechaCreacion: { $gte: fechaInicio, $lte: fechaFin }
  }).populate('items.producto', 'nombre precio categoria stock');
  
  // Crear hoja de trabajo
  const worksheet = workbook.addWorksheet('Productos');
  
  // Configurar encabezado
  worksheet.mergeCells('A1:F1');
  const tituloCell = worksheet.getCell('A1');
  tituloCell.value = `REPORTE DE PRODUCTOS - ${fechaInicio.toLocaleString('es', { month: 'long' }).toUpperCase()} ${anio}`;
  tituloCell.font = { size: 16, bold: true };
  tituloCell.alignment = { horizontal: 'center' };
  
  // Encabezados para productos
  worksheet.addRow(['']);
  worksheet.addRow(['Producto', 'Categoría', 'Cantidad Vendida', 'Precio Unitario', 'Total Generado', 'Stock Actual']);
  
  // Procesar productos vendidos
  const productosVendidos = {};
  
  pedidos.forEach(pedido => {
    if (pedido.items && Array.isArray(pedido.items)) {
      pedido.items.forEach(item => {
        const productoId = item.producto?._id || item.productoId;
        
        if (!productoId) return;
        
        if (!productosVendidos[productoId]) {
          productosVendidos[productoId] = {
            nombre: item.producto?.nombre || 'Producto',
            categoria: item.producto?.categoria || 'Sin categoría',
            cantidad: 0,
            precio: item.precio || 0,
            total: 0,
            stock: item.producto?.stock || 0
          };
        }
        
        productosVendidos[productoId].cantidad += item.cantidad || 1;
        productosVendidos[productoId].total += (item.precio || 0) * (item.cantidad || 1);
      });
    }
  });
  
  // Convertir a array y ordenar por cantidad
  const topProductos = Object.values(productosVendidos)
    .sort((a, b) => b.cantidad - a.cantidad);
  
  // Agregar filas de productos
  topProductos.forEach(producto => {
    worksheet.addRow([
      producto.nombre,
      producto.categoria,
      producto.cantidad,
      producto.precio,
      producto.total,
      producto.stock
    ]);
  });
  
  // Dar formato a la tabla
  worksheet.getColumn('A').width = 40;
  worksheet.getColumn('B').width = 20;
  worksheet.getColumn('C').width = 20;
  worksheet.getColumn('D').width = 15;
  worksheet.getColumn('E').width = 15;
  worksheet.getColumn('F').width = 15;
  
  return true;
}

/**
 * Genera el reporte de clientes en Excel
 */
async function generarReporteClientes(mes, anio, workbook) {
  // Implementación para reporte de clientes
  
  // Calcular fechas de inicio y fin del mes
  const fechaInicio = new Date(anio, mes - 1, 1);
  const fechaFin = new Date(anio, mes, 0, 23, 59, 59);
  
  // Obtener pedidos en el rango de fechas con información de usuarios
  const pedidos = await Pedido.find({
    fechaCreacion: { $gte: fechaInicio, $lte: fechaFin }
  }).populate('usuario', 'nombre email fechaCreacion');
  
  // Obtener nuevos usuarios en el rango de fechas
  const nuevosUsuarios = await Usuario.find({
    fechaCreacion: { $gte: fechaInicio, $lte: fechaFin }
  });
  
  // Crear hoja de trabajo
  const worksheet = workbook.addWorksheet('Clientes');
  
  // Configurar encabezado
  worksheet.mergeCells('A1:F1');
  const tituloCell = worksheet.getCell('A1');
  tituloCell.value = `REPORTE DE CLIENTES - ${fechaInicio.toLocaleString('es', { month: 'long' }).toUpperCase()} ${anio}`;
  tituloCell.font = { size: 16, bold: true };
  tituloCell.alignment = { horizontal: 'center' };
  
  // Encabezados para clientes
  worksheet.addRow(['']);
  worksheet.addRow(['Cliente', 'Email', 'Fecha Registro', 'Cantidad Pedidos', 'Gasto Total', 'Ticket Promedio']);
  
  // Procesar datos de clientes
  const clientesActivos = {};
  
  pedidos.forEach(pedido => {
    if (!pedido.usuario || !pedido.usuario._id) return;
    
    const clienteId = pedido.usuario._id.toString();
    
    if (!clientesActivos[clienteId]) {
      clientesActivos[clienteId] = {
        nombre: pedido.usuario.nombre || 'Cliente',
        email: pedido.usuario.email || '',
        fechaRegistro: pedido.usuario.fechaCreacion,
        pedidos: 0,
        gasto: 0
      };
    }
    
    clientesActivos[clienteId].pedidos += 1;
    clientesActivos[clienteId].gasto += pedido.precioTotal || 0;
  });
  
  // Convertir a array y ordenar por gasto
  const listaClientes = Object.values(clientesActivos)
    .sort((a, b) => b.gasto - a.gasto);
  
  // Agregar filas de clientes
  listaClientes.forEach(cliente => {
    worksheet.addRow([
      cliente.nombre,
      cliente.email,
      cliente.fechaRegistro ? new Date(cliente.fechaRegistro).toLocaleDateString() : 'No disponible',
      cliente.pedidos,
      cliente.gasto,
      cliente.pedidos > 0 ? cliente.gasto / cliente.pedidos : 0
    ]);
  });
  
  // Añadir sección de nuevos clientes
  worksheet.addRow(['']);
  worksheet.addRow(['NUEVOS CLIENTES EN EL MES']);
  worksheet.addRow(['Nombre', 'Email', 'Fecha de Registro']);
  
  nuevosUsuarios.forEach(usuario => {
    worksheet.addRow([
      usuario.nombre || 'Cliente',
      usuario.email || '',
      new Date(usuario.fechaCreacion).toLocaleDateString()
    ]);
  });
  
  // Dar formato a la tabla
  worksheet.getColumn('A').width = 30;
  worksheet.getColumn('B').width = 30;
  worksheet.getColumn('C').width = 20;
  worksheet.getColumn('D').width = 20;
  worksheet.getColumn('E').width = 15;
  worksheet.getColumn('F').width = 15;
  
  return true;
}

export default router;
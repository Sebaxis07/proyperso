// routes/reportes.js
import { Router } from 'express';
const router = Router();
import auth from '../middleware/auth';
import admin from '../middleware/admin';
import { find } from '../models/pedido';
import Producto from '../models/producto';
import { countDocuments } from '../models/Usuario';

// @route   GET /api/reportes/mensual
// @desc    Obtener reporte mensual
// @access  Private/Admin
router.get('/mensual', [auth, admin], async (req, res) => {
  try {
    const { mes, anio } = req.query;
    
    // Validar parámetros
    if (!mes || !anio) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requieren los parámetros mes y año' 
      });
    }
    
    // Convertir a números
    const mesNum = parseInt(mes);
    const anioNum = parseInt(anio);
    
    // Calcular fechas de inicio y fin del mes
    const fechaInicio = new Date(anioNum, mesNum - 1, 1);
    const fechaFin = new Date(anioNum, mesNum, 0);
    
    // Obtener pedidos del mes
    const pedidos = await find({
      fechaCreacion: {
        $gte: fechaInicio,
        $lte: fechaFin
      }
    }).populate('productos.producto');
    
    // Obtener pedidos del mes anterior para comparación
    const mesAnterior = mesNum === 1 ? 12 : mesNum - 1;
    const anioAnterior = mesNum === 1 ? anioNum - 1 : anioNum;
    const fechaInicioAnterior = new Date(anioAnterior, mesAnterior - 1, 1);
    const fechaFinAnterior = new Date(anioAnterior, mesAnterior, 0);
    
    const pedidosAnterior = await find({
      fechaCreacion: {
        $gte: fechaInicioAnterior,
        $lte: fechaFinAnterior
      }
    });
    
    // Calcular métricas
    const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
    const totalVentasAnterior = pedidosAnterior.reduce((sum, p) => sum + p.total, 0);
    const porcentajeCambioVentas = totalVentasAnterior > 0 
      ? ((totalVentas - totalVentasAnterior) / totalVentasAnterior) * 100 
      : 0;
    
    // Calcular ventas diarias
    const ventasDiarias = [];
    const diasEnMes = fechaFin.getDate();
    
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(anioNum, mesNum - 1, dia);
      const ventasDelDia = pedidos.filter(p => {
        const pedidoDate = new Date(p.fechaCreacion);
        return pedidoDate.getDate() === fecha.getDate();
      }).reduce((sum, p) => sum + p.total, 0);
      
      ventasDiarias.push({
        dia,
        monto: ventasDelDia
      });
    }
    
    // Calcular top productos
    const productosVendidos = {};
    pedidos.forEach(pedido => {
      pedido.productos.forEach(item => {
        const idProducto = item.producto._id.toString();
        if (!productosVendidos[idProducto]) {
          productosVendidos[idProducto] = {
            id: idProducto,
            nombre: item.producto.nombre,
            ventas: 0
          };
        }
        productosVendidos[idProducto].ventas += item.cantidad * item.precio;
      });
    });
    
    const topProductos = Object.values(productosVendidos)
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 5);
    
    // Calcular ventas por categoría
    const ventasPorCategoria = [];
    const categorias = {};
    
    pedidos.forEach(pedido => {
      pedido.productos.forEach(item => {
        const categoria = item.producto.categoria;
        if (!categorias[categoria]) {
          categorias[categoria] = 0;
        }
        categorias[categoria] += item.cantidad * item.precio;
      });
    });
    
    for (const [categoria, monto] of Object.entries(categorias)) {
      ventasPorCategoria.push({
        categoria,
        monto
      });
    }
    
    // Obtener nuevos clientes en el mes
    const nuevosClientes = await countDocuments({
      fechaRegistro: {
        $gte: fechaInicio,
        $lte: fechaFin
      }
    });
    
    const nuevosClientesAnterior = await countDocuments({
      fechaRegistro: {
        $gte: fechaInicioAnterior,
        $lte: fechaFinAnterior
      }
    });
    
    const porcentajeCambioClientes = nuevosClientesAnterior > 0 
      ? ((nuevosClientes - nuevosClientesAnterior) / nuevosClientesAnterior) * 100 
      : 0;
    
    // Preparar nombres de meses
    const nombresMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Construir respuesta
    const reporte = {
      periodo: {
        mes: mesNum,
        anio: anioNum,
        nombreMes: nombresMeses[mesNum - 1]
      },
      ventas: {
        total: totalVentas,
        porcentajeCambio: porcentajeCambioVentas.toFixed(2)
      },
      pedidos: {
        total: pedidos.length,
        porcentajeCambio: pedidosAnterior.length > 0 
          ? (((pedidos.length - pedidosAnterior.length) / pedidosAnterior.length) * 100).toFixed(2) 
          : 0
      },
      ticketPromedio: {
        valor: pedidos.length > 0 ? totalVentas / pedidos.length : 0,
        porcentajeCambio: pedidosAnterior.length > 0 
          ? ((totalVentas / pedidos.length - totalVentasAnterior / pedidosAnterior.length) / (totalVentasAnterior / pedidosAnterior.length) * 100).toFixed(2) 
          : 0
      },
      nuevosClientes: {
        total: nuevosClientes,
        porcentajeCambio: porcentajeCambioClientes.toFixed(2)
      },
      ventasDiarias,
      topProductos,
      ventasPorCategoria
    };
    
    res.json({ success: true, data: reporte });
  } catch (err) {
    console.error('Error en reporte mensual:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error al generar el reporte mensual',
      error: err.message
    });
  }
});

// @route   GET /api/reportes/ventas-por-periodo
// @desc    Obtener reporte de ventas por periodo
// @access  Private/Admin
router.get('/ventas-por-periodo', [auth, admin], async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    // Validar parámetros
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requieren fechas de inicio y fin' 
      });
    }
    
    // Convertir a fechas
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    // Obtener pedidos del periodo
    const pedidos = await find({
      fechaCreacion: {
        $gte: inicio,
        $lte: fin
      }
    }).populate('productos.producto');
    
    // Calcular ventas por día de la semana
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const ventasPorDiaSemana = diasSemana.map(dia => ({ 
      dia, 
      monto: 0, 
      cantidad: 0 
    }));
    
    pedidos.forEach(pedido => {
      const diaSemana = new Date(pedido.fechaCreacion).getDay();
      ventasPorDiaSemana[diaSemana].monto += pedido.total;
      ventasPorDiaSemana[diaSemana].cantidad += 1;
    });
    
    // Calcular ventas por hora
    const ventasPorHora = Array.from({ length: 24 }, (_, i) => ({ 
      hora: i, 
      monto: 0, 
      cantidad: 0 
    }));
    
    pedidos.forEach(pedido => {
      const hora = new Date(pedido.fechaCreacion).getHours();
      ventasPorHora[hora].monto += pedido.total;
      ventasPorHora[hora].cantidad += 1;
    });
    
    // Calcular ventas por método de pago
    const ventasPorMetodoPago = [];
    const metodosPago = {};
    
    pedidos.forEach(pedido => {
      const metodo = pedido.metodoPago;
      if (!metodosPago[metodo]) {
        metodosPago[metodo] = { monto: 0, cantidad: 0 };
      }
      metodosPago[metodo].monto += pedido.total;
      metodosPago[metodo].cantidad += 1;
    });
    
    for (const [metodo, datos] of Object.entries(metodosPago)) {
      ventasPorMetodoPago.push({
        metodo,
        monto: datos.monto,
        cantidad: datos.cantidad
      });
    }
    
    // Preparar nombres de meses
    const nombresMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Construir respuesta
    const reporte = {
      periodo: {
        fechaInicio: inicio,
        fechaFin: fin,
        mes: inicio.getMonth() + 1,
        anio: inicio.getFullYear(),
        nombreMes: nombresMeses[inicio.getMonth()]
      },
      ventasPorDiaSemana,
      ventasPorHora,
      ventasPorMetodoPago
    };
    
    res.json({ success: true, data: reporte });
  } catch (err) {
    console.error('Error en reporte de ventas por periodo:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error al generar el reporte de ventas',
      error: err.message 
    });
  }
});

// @route   GET /api/reportes/productos
// @desc    Obtener reporte de productos
// @access  Private/Admin
router.get('/productos', [auth, admin], async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    // Validar parámetros
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requieren fechas de inicio y fin' 
      });
    }
    
    // Convertir a fechas
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    // Obtener pedidos del periodo
    const pedidos = await find({
      fechaCreacion: {
        $gte: inicio,
        $lte: fin
      }
    }).populate('productos.producto');
    
    // Calcular productos más vendidos
    const productosVendidos = {};
    
    pedidos.forEach(pedido => {
      pedido.productos.forEach(item => {
        const idProducto = item.producto._id.toString();
        
        if (!productosVendidos[idProducto]) {
          productosVendidos[idProducto] = {
            id: idProducto,
            nombre: item.producto.nombre,
            categoria: item.producto.categoria,
            unidades: 0,
            ventas: 0,
            costo: item.producto.precioCompra || 0
          };
        }
        
        productosVendidos[idProducto].unidades += item.cantidad;
        productosVendidos[idProducto].ventas += item.cantidad * item.precio;
      });
    });
    
    const productosMasVendidos = Object.values(productosVendidos)
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 10);
    
    // Calcular rentabilidad
    const productosPorRentabilidad = Object.values(productosVendidos)
      .map(p => {
        const costo = p.costo * p.unidades;
        const margenTotal = p.ventas - costo;
        const rentabilidad = costo > 0 ? (margenTotal / costo) * 100 : 0;
        
        return {
          ...p,
          margenTotal,
          rentabilidad: parseFloat(rentabilidad.toFixed(2))
        };
      })
      .sort((a, b) => b.rentabilidad - a.rentabilidad)
      .slice(0, 10);
    
    // Simulación de rotación de inventario
    // En un caso real necesitarías datos históricos de inventario
    const rotacionInventario = Object.values(productosVendidos)
      .map(p => {
        // Valores de ejemplo - reemplazar con datos reales
        const inventarioInicial = Math.floor(Math.random() * 100) + 50;
        const stockActual = Math.max(0, inventarioInicial - p.unidades);
        const rotacion = p.unidades / ((inventarioInicial + stockActual) / 2);
        
        return {
          nombre: p.nombre,
          inventarioInicial,
          ventas: p.unidades,
          stockActual,
          rotacion: isNaN(rotacion) ? 0 : rotacion
        };
      })
      .sort((a, b) => b.rotacion - a.rotacion)
      .slice(0, 10);
    
    // Preparar nombres de meses
    const nombresMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Construir respuesta
    const reporte = {
      periodo: {
        fechaInicio: inicio,
        fechaFin: fin,
        mes: inicio.getMonth() + 1,
        anio: inicio.getFullYear(),
        nombreMes: nombresMeses[inicio.getMonth()]
      },
      productosMasVendidos,
      productosPorRentabilidad,
      rotacionInventario
    };
    
    res.json({ success: true, data: reporte });
  } catch (err) {
    console.error('Error en reporte de productos:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error al generar el reporte de productos',
      error: err.message 
    });
  }
});

// @route   GET /api/reportes/clientes
// @desc    Obtener reporte de clientes
// @access  Private/Admin
router.get('/clientes', [auth, admin], async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    // Validar parámetros
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requieren fechas de inicio y fin' 
      });
    }
    
    // Convertir a fechas
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    // Obtener pedidos del periodo
    const pedidos = await find({
      fechaCreacion: {
        $gte: inicio,
        $lte: fin
      }
    }).populate('usuario', 'nombre email');
    
    // Clientes totales en el periodo
    const clientesUnicos = new Set(pedidos.map(p => p.usuario._id.toString()));
    const clientesTotales = clientesUnicos.size;
    
    // Nuevos clientes (simulación)
    // En un caso real consultarías la fecha de registro
    const nuevosClientes = Math.floor(clientesTotales * 0.2);
    
    // Valor cliente promedio
    const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
    const valorClientePromedio = clientesTotales > 0 ? totalVentas / clientesTotales : 0;
    
    // Top clientes
    const clientesData = {};
    
    pedidos.forEach(pedido => {
      const idCliente = pedido.usuario._id.toString();
      
      if (!clientesData[idCliente]) {
        clientesData[idCliente] = {
          id: idCliente,
          nombre: pedido.usuario.nombre,
          email: pedido.usuario.email,
          pedidos: 0,
          totalCompras: 0
        };
      }
      
      clientesData[idCliente].pedidos += 1;
      clientesData[idCliente].totalCompras += pedido.total;
    });
    
    // Calcular ticket promedio por cliente
    Object.values(clientesData).forEach(cliente => {
      cliente.ticketPromedio = cliente.pedidos > 0 
        ? cliente.totalCompras / cliente.pedidos 
        : 0;
    });
    
    const topClientes = Object.values(clientesData)
      .sort((a, b) => b.totalCompras - a.totalCompras)
      .slice(0, 10);
    
    // Frecuencia de compra (simulación)
    const frecuenciaCompra = [
      { categoria: 'Primera compra', cantidad: Math.floor(clientesTotales * 0.4) },
      { categoria: 'Compra ocasional', cantidad: Math.floor(clientesTotales * 0.3) },
      { categoria: 'Compra frecuente', cantidad: Math.floor(clientesTotales * 0.2) },
      { categoria: 'Cliente recurrente', cantidad: Math.floor(clientesTotales * 0.1) }
    ];
    
    // Retención de clientes (simulación)
    const retencionClientes = [
      { mes: 'Enero', tasaRetencion: 65 },
      { mes: 'Febrero', tasaRetencion: 68 },
      { mes: 'Marzo', tasaRetencion: 72 },
      { mes: 'Abril', tasaRetencion: 70 },
      { mes: 'Mayo', tasaRetencion: 75 }
    ];
    
    // Preparar nombres de meses
    const nombresMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Construir respuesta
    const reporte = {
      periodo: {
        fechaInicio: inicio,
        fechaFin: fin,
        mes: inicio.getMonth() + 1,
        anio: inicio.getFullYear(),
        nombreMes: nombresMeses[inicio.getMonth()]
      },
      clientesTotales,
      nuevosClientes,
      valorClientePromedio,
      topClientes,
      frecuenciaCompra,
      retencionClientes
    };
    
    res.json({ success: true, data: reporte });
  } catch (err) {
    console.error('Error en reporte de clientes:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error al generar el reporte de clientes',
      error: err.message 
    });
  }
});

// @route   GET /api/reportes/exportar/:tipo
// @desc    Exportar reporte a Excel
// @access  Private/Admin
router.get('/exportar/:tipo', [auth, admin], async (req, res) => {
  try {
    // Aquí implementarías la lógica para generar un archivo Excel
    // Usando bibliotecas como exceljs o xlsx
    
    // Ejemplo básico (no funcional, solo como referencia):
    // const excel = require('exceljs');
    // const workbook = new excel.Workbook();
    // const worksheet = workbook.addWorksheet('Reporte');
    // ... agregar datos al worksheet
    // const buffer = await workbook.xlsx.writeBuffer();
    // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    // res.setHeader('Content-Disposition', `attachment; filename=reporte.xlsx`);
    // res.send(buffer);
    
    // Por ahora solo devolvemos un error
    res.status(501).json({ 
      success: false, 
      message: 'Funcionalidad de exportación no implementada' 
    });
  } catch (err) {
    console.error('Error al exportar reporte:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error al exportar el reporte',
      error: err.message 
    });
  }
});

export default router;
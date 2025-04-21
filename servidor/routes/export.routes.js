// routes/export.routes.js
import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Pedido from '../models/Pedido.js';
import Producto from '../models/Producto.js';
import Usuario from '../models/Usuario.js';
import pkg from 'exceljs';
const { Workbook } = pkg;

const router = Router();

// @route   GET /api/reportes/exportar/:tipo
// @desc    Exportar reporte a Excel
// @access  Private/Admin
router.get('/exportar/:tipo', [protect, authorize('admin')], async (req, res) => {
  try {
    const { tipo } = req.params;
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
    const fechaFin = new Date(anioNum, mesNum, 0, 23, 59, 59, 999);
    
    // Crear un nuevo libro de trabajo
    const workbook = new Workbook();
    workbook.creator = 'Tienda de Mascotas';
    workbook.created = new Date();
    
    // Nombres de los meses
    const nombresMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    // Función para formatear moneda
    const formatMoney = (amount) => {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
      }).format(amount);
    };
    
    let fileName = '';
    
    // Crear hojas de trabajo según el tipo de reporte
    switch (tipo) {
      case 'mensual': {
        fileName = `reporte_mensual_${anioNum}_${mesNum}.xlsx`;
        
        // Obtener pedidos del mes
        const pedidos = await Pedido.find({
          fechaCreacion: {
            $gte: fechaInicio,
            $lte: fechaFin
          }
        }).populate('productos.producto usuario');
        
        // Crear hoja de resumen
        const resumenSheet = workbook.addWorksheet('Resumen');
        
        // Título
        resumenSheet.getCell('A1').value = `Reporte Mensual - ${nombresMeses[mesNum - 1]} ${anioNum}`;
        resumenSheet.getCell('A1').font = { bold: true, size: 16 };
        resumenSheet.mergeCells('A1:E1');
        
        // Métricas principales
        resumenSheet.getCell('A3').value = 'Métrica';
        resumenSheet.getCell('B3').value = 'Valor';
        resumenSheet.getCell('C3').value = 'Vs. Mes Anterior';
        
        resumenSheet.getCell('A3').font = { bold: true };
        resumenSheet.getCell('B3').font = { bold: true };
        resumenSheet.getCell('C3').font = { bold: true };
        
        // Ventas totales
        const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
        resumenSheet.getCell('A4').value = 'Ventas Totales';
        resumenSheet.getCell('B4').value = totalVentas;
        resumenSheet.getCell('B4').numFmt = '#,##0';
        
        // Número de pedidos
        resumenSheet.getCell('A5').value = 'Número de Pedidos';
        resumenSheet.getCell('B5').value = pedidos.length;
        
        // Ticket promedio
        const ticketPromedio = pedidos.length > 0 ? totalVentas / pedidos.length : 0;
        resumenSheet.getCell('A6').value = 'Ticket Promedio';
        resumenSheet.getCell('B6').value = ticketPromedio;
        resumenSheet.getCell('B6').numFmt = '#,##0';
        
        // Crear hoja de pedidos
        const pedidosSheet = workbook.addWorksheet('Pedidos');
        
        // Encabezados
        pedidosSheet.columns = [
          { header: 'ID Pedido', key: 'id', width: 20 },
          { header: 'Cliente', key: 'cliente', width: 30 },
          { header: 'Fecha', key: 'fecha', width: 20 },
          { header: 'Estado', key: 'estado', width: 15 },
          { header: 'Método de Pago', key: 'metodoPago', width: 20 },
          { header: 'Total', key: 'total', width: 15 }
        ];
        
        // Formato para encabezados
        pedidosSheet.getRow(1).font = { bold: true };
        
        // Datos
        pedidos.forEach(pedido => {
          pedidosSheet.addRow({
            id: pedido._id.toString(),
            cliente: pedido.usuario ? pedido.usuario.nombre : 'Cliente no disponible',
            fecha: new Date(pedido.fechaCreacion).toLocaleString('es-CL'),
            estado: pedido.estadoPedido,
            metodoPago: pedido.metodoPago,
            total: pedido.total
          });
        });
        
        // Formato para columna de total
        pedidosSheet.getColumn('total').numFmt = '#,##0';
        
        // Crear hoja de productos vendidos
        const productosSheet = workbook.addWorksheet('Productos Vendidos');
        
        // Encabezados
        productosSheet.columns = [
          { header: 'ID Producto', key: 'id', width: 20 },
          { header: 'Nombre', key: 'nombre', width: 30 },
          { header: 'Categoría', key: 'categoria', width: 20 },
          { header: 'Unidades Vendidas', key: 'unidades', width: 20 },
          { header: 'Ventas Totales', key: 'ventas', width: 20 }
        ];
        
        // Formato para encabezados
        productosSheet.getRow(1).font = { bold: true };
        
        // Calcular ventas por producto
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
                ventas: 0
              };
            }
            
            productosVendidos[idProducto].unidades += item.cantidad;
            productosVendidos[idProducto].ventas += item.cantidad * item.precio;
          });
        });
        
        // Datos
        Object.values(productosVendidos)
          .sort((a, b) => b.ventas - a.ventas)
          .forEach(producto => {
            productosSheet.addRow({
              id: producto.id,
              nombre: producto.nombre,
              categoria: producto.categoria,
              unidades: producto.unidades,
              ventas: producto.ventas
            });
          });
        
        // Formato para columna de ventas
        productosSheet.getColumn('ventas').numFmt = '#,##0';
        break;
      }
      
      case 'ventas': {
        fileName = `reporte_ventas_${anioNum}_${mesNum}.xlsx`;
        
        // Obtener pedidos del mes
        const pedidos = await Pedido.find({
          fechaCreacion: {
            $gte: fechaInicio,
            $lte: fechaFin
          }
        }).populate('productos.producto usuario');
        
        // Crear hoja de ventas por día
        const ventasDiariasSheet = workbook.addWorksheet('Ventas Diarias');
        
        // Encabezados
        ventasDiariasSheet.columns = [
          { header: 'Día', key: 'dia', width: 10 },
          { header: 'Fecha', key: 'fecha', width: 20 },
          { header: 'Cantidad Pedidos', key: 'cantidadPedidos', width: 20 },
          { header: 'Ventas Totales', key: 'ventas', width: 20 }
        ];
        
        // Formato para encabezados
        ventasDiariasSheet.getRow(1).font = { bold: true };
        
        // Calcular ventas por día
        const ventasPorDia = {};
        const diasEnMes = fechaFin.getDate();
        
        for (let dia = 1; dia <= diasEnMes; dia++) {
          const fecha = new Date(anioNum, mesNum - 1, dia);
          ventasPorDia[dia] = {
            dia,
            fecha,
            cantidadPedidos: 0,
            ventas: 0
          };
        }
        
        pedidos.forEach(pedido => {
          const fechaPedido = new Date(pedido.fechaCreacion);
          const dia = fechaPedido.getDate();
          
          ventasPorDia[dia].cantidadPedidos += 1;
          ventasPorDia[dia].ventas += pedido.total;
        });
        
        // Datos
        Object.values(ventasPorDia).forEach(dia => {
          ventasDiariasSheet.addRow({
            dia: dia.dia,
            fecha: dia.fecha.toLocaleDateString('es-CL'),
            cantidadPedidos: dia.cantidadPedidos,
            ventas: dia.ventas
          });
        });
        
        // Formato para columna de ventas
        ventasDiariasSheet.getColumn('ventas').numFmt = '#,##0';
        
        // Crear hoja de ventas por método de pago
        const metodosPagoSheet = workbook.addWorksheet('Por Método de Pago');
        
        // Encabezados
        metodosPagoSheet.columns = [
          { header: 'Método de Pago', key: 'metodo', width: 30 },
          { header: 'Cantidad Pedidos', key: 'cantidad', width: 20 },
          { header: 'Ventas Totales', key: 'monto', width: 20 },
          { header: 'Porcentaje del Total', key: 'porcentaje', width: 20 }
        ];
        
        // Formato para encabezados
        metodosPagoSheet.getRow(1).font = { bold: true };
        
        // Calcular ventas por método de pago
        const ventasPorMetodoPago = {};
        const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
        
        pedidos.forEach(pedido => {
          const metodo = pedido.metodoPago;
          
          if (!ventasPorMetodoPago[metodo]) {
            ventasPorMetodoPago[metodo] = {
              metodo,
              cantidad: 0,
              monto: 0
            };
          }
          
          ventasPorMetodoPago[metodo].cantidad += 1;
          ventasPorMetodoPago[metodo].monto += pedido.total;
        });
        
        // Datos
        Object.values(ventasPorMetodoPago)
          .sort((a, b) => b.monto - a.monto)
          .forEach(metodoPago => {
            const porcentaje = totalVentas > 0 ? (metodoPago.monto / totalVentas) * 100 : 0;
            
            metodosPagoSheet.addRow({
              metodo: metodoPago.metodo,
              cantidad: metodoPago.cantidad,
              monto: metodoPago.monto,
              porcentaje: porcentaje.toFixed(2)
            });
          });
        
        // Formato para columnas
        metodosPagoSheet.getColumn('monto').numFmt = '#,##0';
        metodosPagoSheet.getColumn('porcentaje').numFmt = '0.00%';
        break;
      }
      
      case 'productos': {
        fileName = `reporte_productos_${anioNum}_${mesNum}.xlsx`;
        
        // Obtener pedidos del mes
        const pedidos = await Pedido.find({
          fechaCreacion: {
            $gte: fechaInicio,
            $lte: fechaFin
          }
        }).populate('productos.producto');
        
        // Crear hoja de productos más vendidos
        const masVendidosSheet = workbook.addWorksheet('Más Vendidos');
        
        // Encabezados
        masVendidosSheet.columns = [
          { header: 'ID Producto', key: 'id', width: 20 },
          { header: 'Nombre', key: 'nombre', width: 30 },
          { header: 'Categoría', key: 'categoria', width: 20 },
          { header: 'Unidades Vendidas', key: 'unidades', width: 20 },
          { header: 'Ventas Totales', key: 'ventas', width: 20 }
        ];
        
        // Formato para encabezados
        masVendidosSheet.getRow(1).font = { bold: true };
        
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
                ventas: 0
              };
            }
            
            productosVendidos[idProducto].unidades += item.cantidad;
            productosVendidos[idProducto].ventas += item.cantidad * item.precio;
          });
        });
        
        // Datos
        Object.values(productosVendidos)
          .sort((a, b) => b.unidades - a.unidades)
          .forEach(producto => {
            masVendidosSheet.addRow({
              id: producto.id,
              nombre: producto.nombre,
              categoria: producto.categoria,
              unidades: producto.unidades,
              ventas: producto.ventas
            });
          });
        
        // Formato para columna de ventas
        masVendidosSheet.getColumn('ventas').numFmt = '#,##0';
        
        // Crear hoja de ventas por categoría
        const categoriasSheet = workbook.addWorksheet('Por Categoría');
        
        // Encabezados
        categoriasSheet.columns = [
          { header: 'Categoría', key: 'categoria', width: 30 },
          { header: 'Unidades Vendidas', key: 'unidades', width: 20 },
          { header: 'Ventas Totales', key: 'ventas', width: 20 },
          { header: 'Porcentaje del Total', key: 'porcentaje', width: 20 }
        ];
        
        // Formato para encabezados
        categoriasSheet.getRow(1).font = { bold: true };
        
        // Calcular ventas por categoría
        const ventasPorCategoria = {};
        const totalVentas = pedidos.reduce((sum, pedido) => {
          return sum + pedido.productos.reduce((prodSum, item) => {
            return prodSum + (item.cantidad * item.precio);
          }, 0);
        }, 0);
        
        pedidos.forEach(pedido => {
          pedido.productos.forEach(item => {
            const categoria = item.producto.categoria;
            
            if (!ventasPorCategoria[categoria]) {
              ventasPorCategoria[categoria] = {
                categoria,
                unidades: 0,
                ventas: 0
              };
            }
            
            ventasPorCategoria[categoria].unidades += item.cantidad;
            ventasPorCategoria[categoria].ventas += item.cantidad * item.precio;
          });
        });
        
        // Datos
        Object.values(ventasPorCategoria)
          .sort((a, b) => b.ventas - a.ventas)
          .forEach(categoria => {
            const porcentaje = totalVentas > 0 ? (categoria.ventas / totalVentas) * 100 : 0;
            
            categoriasSheet.addRow({
              categoria: categoria.categoria,
              unidades: categoria.unidades,
              ventas: categoria.ventas,
              porcentaje: porcentaje.toFixed(2)
            });
          });
        
        // Formato para columnas
        categoriasSheet.getColumn('ventas').numFmt = '#,##0';
        categoriasSheet.getColumn('porcentaje').numFmt = '0.00%';
        break;
      }
      
      case 'clientes': {
        fileName = `reporte_clientes_${anioNum}_${mesNum}.xlsx`;
        
        // Obtener pedidos del mes
        const pedidos = await Pedido.find({
          fechaCreacion: {
            $gte: fechaInicio,
            $lte: fechaFin
          }
        }).populate('usuario', 'nombre email');
        
        // Crear hoja de clientes más activos
        const clientesSheet = workbook.addWorksheet('Clientes Activos');
        
        // Encabezados
        clientesSheet.columns = [
          { header: 'ID Cliente', key: 'id', width: 20 },
          { header: 'Nombre', key: 'nombre', width: 30 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Número de Pedidos', key: 'pedidos', width: 20 },
          { header: 'Total Compras', key: 'totalCompras', width: 20 },
          { header: 'Ticket Promedio', key: 'ticketPromedio', width: 20 }
        ];
        
        // Formato para encabezados
        clientesSheet.getRow(1).font = { bold: true };
        
        // Calcular datos por cliente
        const clientesData = {};
        
        pedidos.forEach(pedido => {
          if (!pedido.usuario) return;
          
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
        
        // Calcular ticket promedio
        Object.values(clientesData).forEach(cliente => {
          cliente.ticketPromedio = cliente.pedidos > 0 
            ? cliente.totalCompras / cliente.pedidos 
            : 0;
        });
        
        // Datos
        Object.values(clientesData)
          .sort((a, b) => b.totalCompras - a.totalCompras)
          .forEach(cliente => {
            clientesSheet.addRow({
              id: cliente.id,
              nombre: cliente.nombre,
              email: cliente.email,
              pedidos: cliente.pedidos,
              totalCompras: cliente.totalCompras,
              ticketPromedio: cliente.ticketPromedio
            });
          });
        
        // Formato para columnas
        clientesSheet.getColumn('totalCompras').numFmt = '#,##0';
        clientesSheet.getColumn('ticketPromedio').numFmt = '#,##0';
        break;
      }
      
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Tipo de reporte no válido' 
        });
    }
    
    // Generar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Enviar archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(buffer);
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
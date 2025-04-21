// pages/admin/Reportes.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Reportes = () => {
  // Estado para almacenar tipo de reporte actual
  const [reporteActual, setReporteActual] = useState('mensual');
  
  // Estados para filtros
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState({
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear()
  });
  
  // Estado para almacenar datos del reporte
  const [reporteData, setReporteData] = useState(null);
  
  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Navegación y ubicación
  const navigate = useNavigate();
  const location = useLocation();
  
  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Al cargar el componente, verificar query params para establecer el tipo de reporte
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tipo = searchParams.get('tipo');
    
    if (tipo && ['mensual', 'ventas', 'productos', 'clientes'].includes(tipo)) {
      setReporteActual(tipo);
    }
    
    const mes = searchParams.get('mes');
    const anio = searchParams.get('anio');
    
    if (mes && anio) {
      setPeriodoSeleccionado({
        mes: parseInt(mes),
        anio: parseInt(anio)
      });
    }
    
    // Cargar reporte al iniciar
    cargarReporte();
  }, [location.search]);
  
  // Formatear número como moneda
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Función para cambiar tipo de reporte
  const cambiarTipoReporte = (tipo) => {
    setReporteActual(tipo);
    
    // Actualizar URL sin recargar página
    const searchParams = new URLSearchParams();
    searchParams.set('tipo', tipo);
    searchParams.set('mes', periodoSeleccionado.mes);
    searchParams.set('anio', periodoSeleccionado.anio);
    
    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    });
    
    // Cargar nuevo reporte
    cargarReporte(tipo, periodoSeleccionado);
  };
  
  // Función para cambiar periodo
  const cambiarPeriodo = (mes, anio) => {
    const nuevoPeriodo = { mes, anio };
    setPeriodoSeleccionado(nuevoPeriodo);
    
    // Actualizar URL sin recargar página
    const searchParams = new URLSearchParams();
    searchParams.set('tipo', reporteActual);
    searchParams.set('mes', mes);
    searchParams.set('anio', anio);
    
    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    });
    
    // Cargar nuevo reporte
    cargarReporte(reporteActual, nuevoPeriodo);
  };
  
  // Función para cargar el reporte
  const cargarReporte = async (tipo = reporteActual, periodo = periodoSeleccionado) => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener token de autenticación
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No estás autenticado');
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      let url = '';
      let params = {};
      
      // Construir URL y parámetros según el tipo de reporte
      switch (tipo) {
        case 'mensual':
          url = '/api/reportes/mensual';
          params = {
            mes: periodo.mes,
            anio: periodo.anio
          };
          break;
        case 'ventas':
          url = '/api/reportes/ventas-por-periodo';
          params = {
            periodo: 'mes',
            fechaInicio: `${periodo.anio}-${periodo.mes.toString().padStart(2, '0')}-01`,
            fechaFin: new Date(periodo.anio, periodo.mes, 0).toISOString().split('T')[0]
          };
          break;
        case 'productos':
          url = '/api/reportes/productos';
          params = {
            fechaInicio: `${periodo.anio}-${periodo.mes.toString().padStart(2, '0')}-01`,
            fechaFin: new Date(periodo.anio, periodo.mes, 0).toISOString().split('T')[0]
          };
          break;
        case 'clientes':
          url = '/api/reportes/clientes';
          params = {
            fechaInicio: `${periodo.anio}-${periodo.mes.toString().padStart(2, '0')}-01`,
            fechaFin: new Date(periodo.anio, periodo.mes, 0).toISOString().split('T')[0]
          };
          break;
        default:
          url = '/api/reportes/mensual';
      }
      
      // Realizar solicitud al servidor
      const response = await axios.get(url, { 
        ...config, 
        params 
      });
      
      if (response.data.success) {
        setReporteData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Error al cargar el reporte');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar el reporte:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar el reporte');
      setLoading(false);
    }
  };
  
  // Función para exportar a Excel
  const exportarAExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No estás autenticado');
      }
      
      // Construir URL para la exportación
      let url = `/api/reportes/exportar/${reporteActual}`;
      const params = {
        mes: periodoSeleccionado.mes,
        anio: periodoSeleccionado.anio
      };
      
      // Configurar headers para descarga
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params,
        responseType: 'blob'
      };
      
      // Realizar solicitud
      const response = await axios.get(url, config);
      
      // Crear objeto URL para la descarga
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Crear elemento para descarga y simular clic
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `reporte_${reporteActual}_${periodoSeleccionado.anio}_${periodoSeleccionado.mes}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Error al exportar reporte:', err);
      setError('Error al exportar el reporte. Por favor, intenta nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
        <p>{error}</p>
      </div>
    );
  }

  // Componente para mostrar el reporte mensual
  const renderReporteMensual = () => {
    if (!reporteData) return null;
    
    return (
      <div className="space-y-6">
        {/* Información del periodo */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">
            Reporte de {reporteData.periodo.nombreMes} {reporteData.periodo.anio}
          </h3>
          
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Total Ventas</h4>
              <p className="text-2xl font-bold text-blue-700">{formatMoney(reporteData.ventas.total)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {reporteData.ventas.porcentajeCambio >= 0 ? '↑' : '↓'} 
                {Math.abs(reporteData.ventas.porcentajeCambio)}% vs mes anterior
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Total Pedidos</h4>
              <p className="text-2xl font-bold text-green-700">{reporteData.pedidos.total}</p>
              <p className="text-sm text-gray-500 mt-1">
                {reporteData.pedidos.porcentajeCambio >= 0 ? '↑' : '↓'} 
                {Math.abs(reporteData.pedidos.porcentajeCambio)}% vs mes anterior
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Ticket Promedio</h4>
              <p className="text-2xl font-bold text-yellow-700">{formatMoney(reporteData.ticketPromedio.valor)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {reporteData.ticketPromedio.porcentajeCambio >= 0 ? '↑' : '↓'} 
                {Math.abs(reporteData.ticketPromedio.porcentajeCambio)}% vs mes anterior
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Nuevos Clientes</h4>
              <p className="text-2xl font-bold text-purple-700">{reporteData.nuevosClientes.total}</p>
              <p className="text-sm text-gray-500 mt-1">
                {reporteData.nuevosClientes.porcentajeCambio >= 0 ? '↑' : '↓'} 
                {Math.abs(reporteData.nuevosClientes.porcentajeCambio)}% vs mes anterior
              </p>
            </div>
          </div>
        </div>
        
        {/* Gráfico de ventas diarias */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Ventas Diarias</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reporteData.ventasDiarias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip formatter={(value) => formatMoney(value)} />
              <Legend />
              <Area type="monotone" dataKey="monto" stroke="#8884d8" fill="#8884d8" name="Ventas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Top productos y categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Productos */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Top Productos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reporteData.topProductos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip formatter={(value) => formatMoney(value)} />
                <Legend />
                <Bar dataKey="ventas" name="Ventas" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Ventas por Categoría */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Ventas por Categoría</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reporteData.ventasPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="monto"
                  nameKey="categoria"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {reporteData.ventasPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatMoney(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };
  
  // Componente para mostrar el reporte de ventas
  const renderReporteVentas = () => {
    if (!reporteData) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">
            Reporte de Ventas - {reporteData.periodo.nombreMes} {reporteData.periodo.anio}
          </h3>
          
          {/* Gráfico de ventas por día de la semana */}
          <div className="mt-6">
            <h4 className="text-md font-medium mb-2">Ventas por Día de la Semana</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reporteData.ventasPorDiaSemana}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip formatter={(value) => formatMoney(value)} />
                <Legend />
                <Bar dataKey="monto" name="Monto" fill="#0088FE" />
                <Bar dataKey="cantidad" name="Cantidad" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Ventas por hora del día */}
          <div className="mt-8">
            <h4 className="text-md font-medium mb-2">Ventas por Hora</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reporteData.ventasPorHora}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip formatter={(value, name) => name === 'monto' ? formatMoney(value) : value} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="monto" name="Monto" stroke="#8884d8" />
                <Line yAxisId="right" type="monotone" dataKey="cantidad" name="Cantidad" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Métodos de pago */}
          <div className="mt-8">
            <h4 className="text-md font-medium mb-2">Ventas por Método de Pago</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={reporteData.ventasPorMetodoPago}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="monto"
                    nameKey="metodo"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {reporteData.ventasPorMetodoPago.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="p-4">
                <h5 className="font-medium mb-2">Detalle por Método de Pago</h5>
                <div className="space-y-2">
                  {reporteData.ventasPorMetodoPago.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span>{item.metodo}</span>
                      </div>
                      <span className="font-medium">{formatMoney(item.monto)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Componente para mostrar el reporte de productos
  const renderReporteProductos = () => {
    if (!reporteData) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">
            Reporte de Productos - {reporteData.periodo.nombreMes} {reporteData.periodo.anio}
          </h3>
          
          {/* Top productos más vendidos */}
          <div className="mt-6">
            <h4 className="text-md font-medium mb-2">Productos más Vendidos</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Producto</th>
                    <th className="py-2 px-4 border-b text-left">Categoría</th>
                    <th className="py-2 px-4 border-b text-right">Unidades</th>
                    <th className="py-2 px-4 border-b text-right">Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteData.productosMasVendidos.map((producto, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-4 border-b">{producto.nombre}</td>
                      <td className="py-2 px-4 border-b">{producto.categoria}</td>
                      <td className="py-2 px-4 border-b text-right">{producto.unidades}</td>
                      <td className="py-2 px-4 border-b text-right">{formatMoney(producto.ventas)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Productos por rentabilidad */}
          <div className="mt-8">
            <h4 className="text-md font-medium mb-2">Productos por Rentabilidad</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reporteData.productosPorRentabilidad} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nombre" width={150} />
                <Tooltip formatter={(value, name) => name === 'rentabilidad' ? `${value}%` : formatMoney(value)} />
                <Legend />
                <Bar dataKey="margenTotal" name="Margen Total" fill="#0088FE" />
                <Bar dataKey="rentabilidad" name="% Rentabilidad" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Rotación de inventario */}
          <div className="mt-8">
            <h4 className="text-md font-medium mb-2">Rotación de Inventario</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Producto</th>
                      <th className="py-2 px-4 border-b text-right">Inventario Inicial</th>
                      <th className="py-2 px-4 border-b text-right">Ventas</th>
                      <th className="py-2 px-4 border-b text-right">Stock Actual</th>
                      <th className="py-2 px-4 border-b text-right">Rotación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporteData.rotacionInventario.map((producto, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-4 border-b">{producto.nombre}</td>
                        <td className="py-2 px-4 border-b text-right">{producto.inventarioInicial}</td>
                        <td className="py-2 px-4 border-b text-right">{producto.ventas}</td>
                        <td className="py-2 px-4 border-b text-right">{producto.stockActual}</td>
                        <td className="py-2 px-4 border-b text-right">{producto.rotacion.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Componente para mostrar el reporte de clientes
  const renderReporteClientes = () => {
    if (!reporteData) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">
            Reporte de Clientes - {reporteData.periodo.nombreMes} {reporteData.periodo.anio}
          </h3>
          
          {/* Métricas principales de clientes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Clientes Totales</h4>
              <p className="text-2xl font-bold text-blue-700">{reporteData.clientesTotales}</p>
              <p className="text-sm text-gray-500 mt-1">Activos en el periodo</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Nuevos Clientes</h4>
              <p className="text-2xl font-bold text-green-700">{reporteData.nuevosClientes}</p>
              <p className="text-sm text-gray-500 mt-1">Registrados en el periodo</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Valor Cliente Promedio</h4>
              <p className="text-2xl font-bold text-yellow-700">{formatMoney(reporteData.valorClientePromedio)}</p>
              <p className="text-sm text-gray-500 mt-1">Ventas / Nº Clientes</p>
            </div>
          </div>
          
          {/* Top clientes */}
          <div className="mt-8">
            <h4 className="text-md font-medium mb-2">Top Clientes por Compras</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Cliente</th>
                    <th className="py-2 px-4 border-b text-left">Email</th>
                    <th className="py-2 px-4 border-b text-right">Pedidos</th>
                    <th className="py-2 px-4 border-b text-right">Total Compras</th>
                    <th className="py-2 px-4 border-b text-right">Ticket Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteData.topClientes.map((cliente, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-4 border-b">{cliente.nombre}</td>
                      <td className="py-2 px-4 border-b">{cliente.email}</td>
                      <td className="py-2 px-4 border-b text-right">{cliente.pedidos}</td>
                      <td className="py-2 px-4 border-b text-right">{formatMoney(cliente.totalCompras)}</td>
                      <td className="py-2 px-4 border-b text-right">{formatMoney(cliente.ticketPromedio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Frecuencia de compra */}
          <div className="mt-8">
            <h4 className="text-md font-medium mb-2">Frecuencia de Compra</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reporteData.frecuenciaCompra}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cantidad"
                  nameKey="categoria"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {reporteData.frecuenciaCompra.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Retención de clientes */}
          <div className="mt-8">
            <h4 className="text-md font-medium mb-2">Retención de Clientes</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reporteData.retencionClientes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Line type="monotone" dataKey="tasaRetencion" name="Tasa de Retención" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Reportes</h2>
        
        {/* Filtros de periodo */}
        <div className="flex flex-wrap gap-2">
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={periodoSeleccionado.mes}
            onChange={(e) => cambiarPeriodo(parseInt(e.target.value), periodoSeleccionado.anio)}
          >
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
          
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={periodoSeleccionado.anio}
            onChange={(e) => cambiarPeriodo(periodoSeleccionado.mes, parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <button
            onClick={exportarAExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm1 4h12v10a1 1 0 01-1 1H5a1 1 0 01-1-1V7z" clipRule="evenodd" />
              <path d="M7 9a1 1 0 011-1h1a1 1 0 110 2H8a1 1 0 01-1-1z" />
              <path d="M7 12a1 1 0 011-1h1a1 1 0 110 2H8a1 1 0 01-1-1z" />
            </svg>
            Exportar a Excel
          </button>
        </div>
      </div>
      
      {/* Menú de navegación entre reportes */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex flex-wrap">
          <button
            className={`px-4 py-3 text-sm font-medium ${
              reporteActual === 'mensual' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => cambiarTipoReporte('mensual')}
          >
            Reporte Mensual
          </button>
          
          <button
            className={`px-4 py-3 text-sm font-medium ${
              reporteActual === 'ventas' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => cambiarTipoReporte('ventas')}
          >
            Análisis de Ventas
          </button>
          
          <button
            className={`px-4 py-3 text-sm font-medium ${
              reporteActual === 'productos' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => cambiarTipoReporte('productos')}
          >
            Análisis de Productos
          </button>
          
          <button
            className={`px-4 py-3 text-sm font-medium ${
              reporteActual === 'clientes' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => cambiarTipoReporte('clientes')}
          >
            Análisis de Clientes
          </button>
        </div>
      </div>
      
      {/* Contenido del reporte según tipo seleccionado */}
      {reporteActual === 'mensual' && renderReporteMensual()}
      {reporteActual === 'ventas' && renderReporteVentas()}
      {reporteActual === 'productos' && renderReporteProductos()}
      {reporteActual === 'clientes' && renderReporteClientes()}
    </div>
  );
};
export default Reportes;
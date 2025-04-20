// cliente/src/pages/admin/Reportes.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
      setError(err.message || 'Error al cargar el reporte. Por favor, intenta nuevamente.');
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

  // Componentes específicos para cada tipo de reporte
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
              <h4 className="text-gray-600 text-sm">Ventas Totales</h4>
              <p className="text-2xl font-bold">${reporteData.metricas.ventasTotales.toLocaleString()}</p>
              <div className={`text-sm mt-1 ${reporteData.metricas.comparacionMesAnterior.variacionPorcentual >= 0 
                ? 'text-green-600' : 'text-red-600'}`}>
                {reporteData.metricas.comparacionMesAnterior.variacionPorcentual >= 0 ? '↑' : '↓'} 
                {Math.abs(reporteData.metricas.comparacionMesAnterior.variacionPorcentual).toFixed(1)}% vs mes anterior
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Cantidad de Pedidos</h4>
              <p className="text-2xl font-bold">{reporteData.metricas.cantidadPedidos}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Ticket Promedio</h4>
              <p className="text-2xl font-bold">${reporteData.metricas.ticketPromedio.toFixed(2)}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Nuevos Usuarios</h4>
              <p className="text-2xl font-bold">{reporteData.metricas.usuariosNuevos}</p>
            </div>
          </div>
        </div>
        
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas diarias */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Ventas Diarias</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reporteData.graficos.ventasDiarias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => [
                  name === 'ventas' ? `$${value.toLocaleString()}` : value,
                  name === 'ventas' ? 'Ventas' : 'Pedidos'
                ]} />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#8884d8" 
                  name="Ventas ($)" 
                  strokeWidth={2} 
                  dot={{ r: 3 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="pedidos" 
                  stroke="#82ca9d" 
                  name="Cantidad de Pedidos" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Productos más vendidos */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={reporteData.graficos.productosMasVendidos.slice(0, 5)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="nombre" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => [`${value} unidades`, 'Cantidad']} />
                <Legend />
                <Bar dataKey="cantidad" fill="#8884d8" name="Unidades Vendidas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Estado de pedidos */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Estado de Pedidos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reporteData.graficos.estadoPedidos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cantidad"
                  nameKey="estado"
                  label={({ estado, percent }) => `${estado}: ${(percent * 100).toFixed(0)}%`}
                >
                  {reporteData.graficos.estadoPedidos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} pedidos`, props.payload.estado]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Métodos de pago */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Métodos de Pago</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reporteData.graficos.metodosPago}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cantidad"
                  nameKey="metodo"
                  label={({ metodo, percent }) => `${metodo}: ${(percent * 100).toFixed(0)}%`}
                >
                  {reporteData.graficos.metodosPago.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} pedidos ($${props.payload.total.toLocaleString()})`, props.payload.metodo]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Tabla de detalle de pedidos */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Detalle de Pedidos</h3>
            <button 
              onClick={exportarAExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Exportar a Excel
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">ID</th>
                  <th className="py-2 px-4 border-b text-left">Fecha</th>
                  <th className="py-2 px-4 border-b text-left">Cliente</th>
                  <th className="py-2 px-4 border-b text-left">Total</th>
                  <th className="py-2 px-4 border-b text-left">Estado</th>
                  <th className="py-2 px-4 border-b text-left">Método Pago</th>
                </tr>
              </thead>
              <tbody>
                {reporteData.detallePedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="py-2 px-4 border-b">{pedido.id.substring(0, 8)}...</td>
                    <td className="py-2 px-4 border-b">{new Date(pedido.fecha).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">{pedido.cliente}</td>
                    <td className="py-2 px-4 border-b">${pedido.total.toLocaleString()}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        pedido.estado === 'entregado' ? 'bg-green-100 text-green-800' : 
                        pedido.estado === 'enviado' ? 'bg-blue-100 text-blue-800' : 
                        pedido.estado === 'pagado' ? 'bg-yellow-100 text-yellow-800' :
                        pedido.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pedido.estado || 'pendiente'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">{pedido.metodoPago || 'No especificado'}</td>
                  </tr>
                ))}
                
                {reporteData.detallePedidos.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-500">
                      No hay pedidos en este periodo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar componente de productos
  const renderReporteProductos = () => {
    if (!reporteData) return null;
    
    return (
      <div className="space-y-6">
        {/* Información del periodo */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">
            Reporte de Productos: {new Date(reporteData.periodo.fechaInicio).toLocaleDateString()} - {new Date(reporteData.periodo.fechaFin).toLocaleDateString()}
          </h3>
          
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Total Productos Vendidos</h4>
              <p className="text-2xl font-bold">{reporteData.resumen.totalProductosVendidos}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Ingresos Generados</h4>
              <p className="text-2xl font-bold">${reporteData.resumen.ingresosGenerados.toLocaleString()}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Productos Distintos</h4>
              <p className="text-2xl font-bold">{reporteData.resumen.productosDistintos}</p>
            </div>
          </div>
        </div>
        
        {/* Gráficos de productos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top productos */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={reporteData.productos.slice(0, 10)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="nombre" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => [`${value} unidades`, 'Cantidad']} />
                <Legend />
                <Bar dataKey="cantidad" fill="#8884d8" name="Unidades Vendidas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Ventas por categoría */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Ventas por Categoría</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={reporteData.categorias}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="ingresos"
                  nameKey="categoria"
                  label={({ categoria, percent }) => `${categoria}: ${(percent * 100).toFixed(0)}%`}
                >
                  {reporteData.categorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Lista de productos */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Listado de Productos</h3>
            <button 
              onClick={exportarAExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Exportar a Excel
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Producto</th>
                  <th className="py-2 px-4 border-b text-left">Categoría</th>
                  <th className="py-2 px-4 border-b text-left">Cantidad</th>
                  <th className="py-2 px-4 border-b text-left">Precio</th>
                  <th className="py-2 px-4 border-b text-left">Ingresos</th>
                  <th className="py-2 px-4 border-b text-left">Stock Actual</th>
                </tr>
              </thead>
              <tbody>
                {reporteData.productos.map((producto) => (
                  <tr key={producto.id}>
                    <td className="py-2 px-4 border-b">{producto.nombre}</td>
                    <td className="py-2 px-4 border-b">{producto.categoria}</td>
                    <td className="py-2 px-4 border-b">{producto.cantidad}</td>
                    <td className="py-2 px-4 border-b">${producto.precio.toFixed(2)}</td>
                    <td className="py-2 px-4 border-b">${producto.ingresos.toLocaleString()}</td>
                    <td className="py-2 px-4 border-b">{producto.stock}</td>
                  </tr>
                ))}
                
                {reporteData.productos.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-500">
                      No hay datos de productos para este periodo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar componente de clientes
  const renderReporteClientes = () => {
    if (!reporteData) return null;
    
    return (
      <div className="space-y-6">
        {/* Información del periodo */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">
            Reporte de Clientes: {new Date(reporteData.periodo.fechaInicio).toLocaleDateString()} - {new Date(reporteData.periodo.fechaFin).toLocaleDateString()}
          </h3>
          
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Total Clientes</h4>
              <p className="text-2xl font-bold">{reporteData.resumen.totalClientes}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Nuevos Registros</h4>
              <p className="text-2xl font-bold">{reporteData.resumen.nuevosRegistros}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Clientes Activos</h4>
              <p className="text-2xl font-bold">{reporteData.resumen.clientesActivos}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Gasto Promedio</h4>
              <p className="text-2xl font-bold">${reporteData.resumen.gastoPromedio.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribución de clientes */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Distribución de Clientes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Nuevos', value: reporteData.distribucion.nuevos },
                    { name: 'Recurrentes', value: reporteData.distribucion.recurrentes }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#0088FE" />
                  <Cell fill="#00C49F" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Top clientes por gasto */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Top Clientes por Gasto</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={reporteData.clientes.slice(0, 5)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="nombre" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Gasto']} />
                <Legend />
                <Bar dataKey="gasto" fill="#8884d8" name="Gasto Total ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Lista de clientes */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Listado de Clientes</h3>
            <button 
              onClick={exportarAExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Exportar a Excel
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Cliente</th>
                  <th className="py-2 px-4 border-b text-left">Email</th>
                  <th className="py-2 px-4 border-b text-left">Fecha Registro</th>
                  <th className="py-2 px-4 border-b text-left">Pedidos</th>
                  <th className="py-2 px-4 border-b text-left">Gasto Total</th>
                  <th className="py-2 px-4 border-b text-left">Ticket Promedio</th>
                  <th className="py-2 px-4 border-b text-left">Última Compra</th>
                </tr>
              </thead>
              <tbody>
                {reporteData.clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="py-2 px-4 border-b">{cliente.nombre}</td>
                    <td className="py-2 px-4 border-b">{cliente.email}</td>
                    <td className="py-2 px-4 border-b">{new Date(cliente.fechaRegistro).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">{cliente.pedidos}</td>
                    <td className="py-2 px-4 border-b">${cliente.gasto.toLocaleString()}</td>
                    <td className="py-2 px-4 border-b">${cliente.ticketPromedio.toFixed(2)}</td>
                    <td className="py-2 px-4 border-b">{new Date(cliente.ultimaCompra).toLocaleDateString()}</td>
                  </tr>
                ))}
                
                {reporteData.clientes.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-4 text-center text-gray-500">
                      No hay datos de clientes para este periodo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar componente de ventas
  const renderReporteVentas = () => {
    if (!reporteData) return null;
    
    return (
      <div className="space-y-6">
        {/* Información del periodo */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">
            Reporte de Ventas: {new Date(reporteData.fechaInicio).toLocaleDateString()} - {new Date(reporteData.fechaFin).toLocaleDateString()}
          </h3>
          
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Ventas Totales</h4>
              <p className="text-2xl font-bold">${reporteData.ventasTotales.toLocaleString()}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Cantidad de Pedidos</h4>
              <p className="text-2xl font-bold">{reporteData.cantidadPedidos}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-gray-600 text-sm">Ticket Promedio</h4>
              <p className="text-2xl font-bold">
                ${reporteData.cantidadPedidos > 0 ? (reporteData.ventasTotales / reporteData.cantidadPedidos).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Gráfico de ventas */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Ventas por {reporteData.periodo === 'dia' ? 'Hora' : 
                                                    reporteData.periodo === 'semana' ? 'Día' : 
                                                    reporteData.periodo === 'mes' ? 'Día' : 'Mes'}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={reporteData.datosAgrupados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={
                reporteData.periodo === 'dia' ? 'hora' : 
                reporteData.periodo === 'semana' ? 'dia' : 
                reporteData.periodo === 'mes' ? 'dia' : 'mes'
              } />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value, name) => [
                name === 'ventas' ? `$${value.toLocaleString()}` : value,
                name === 'ventas' ? 'Ventas' : 'Pedidos'
              ]} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="ventas" 
                stroke="#8884d8" 
                name="Ventas ($)" 
                strokeWidth={2} 
                dot={{ r: 3 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="pedidos" 
                stroke="#82ca9d" 
                name="Cantidad de Pedidos" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Tabla de datos */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Detalle de Ventas</h3>
            <button 
              onClick={exportarAExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Exportar a Excel
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">
                    {reporteData.periodo === 'dia' ? 'Hora' : 
                     reporteData.periodo === 'semana' ? 'Día' : 
                     reporteData.periodo === 'mes' ? 'Día' : 'Mes'}
                  </th>
                  <th className="py-2 px-4 border-b text-left">Ventas</th>
                  <th className="py-2 px-4 border-b text-left">Pedidos</th>
                  <th className="py-2 px-4 border-b text-left">Ticket Promedio</th>
                </tr>
              </thead>
              <tbody>
                {reporteData.datosAgrupados.map((dato, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">
                      {reporteData.periodo === 'dia' ? `${dato.hora}:00` : 
                       reporteData.periodo === 'semana' ? dato.dia : 
                       reporteData.periodo === 'mes' ? dato.dia : dato.mes}
                    </td>
                    <td className="py-2 px-4 border-b">${dato.ventas.toLocaleString()}</td>
                    <td className="py-2 px-4 border-b">{dato.pedidos}</td>
                    <td className="py-2 px-4 border-b">
                      ${dato.pedidos > 0 ? (dato.ventas / dato.pedidos).toFixed(2) : '0.00'}
                    </td>
                  </tr>
                ))}
                
                {reporteData.datosAgrupados.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      No hay datos de ventas para este periodo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar componente según el tipo de reporte seleccionado
  const renderReporteContenido = () => {
    switch (reporteActual) {
      case 'mensual':
        return renderReporteMensual();
      case 'ventas':
        return renderReporteVentas();
      case 'productos':
        return renderReporteProductos();
      case 'clientes':
        return renderReporteClientes();
      default:
        return renderReporteMensual();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Reportes</h1>
      
      {/* Selector de tipo de reporte */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-4 gap-2">
          <button 
            onClick={() => cambiarTipoReporte('mensual')}
            className={`p-3 rounded-md ${reporteActual === 'mensual' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Reporte Mensual
          </button>
          
          <button 
            onClick={() => cambiarTipoReporte('ventas')}
            className={`p-3 rounded-md ${reporteActual === 'ventas' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Ventas
          </button>
          
          <button 
            onClick={() => cambiarTipoReporte('productos')}
            className={`p-3 rounded-md ${reporteActual === 'productos' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Productos
          </button>
          
          <button 
            onClick={() => cambiarTipoReporte('clientes')}
            className={`p-3 rounded-md ${reporteActual === 'clientes' 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Clientes
          </button>
        </div>
      </div>
      
      {/* Selector de periodo */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Seleccionar Periodo</h2>
          
          <div className="flex space-x-2">
            <select 
              className="border rounded-md px-3 py-2"
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
              className="border rounded-md px-3 py-2"
              value={periodoSeleccionado.anio}
              onChange={(e) => cambiarPeriodo(periodoSeleccionado.mes, parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(anio => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
            
            <button 
              onClick={() => cambiarPeriodo(new Date().getMonth() + 1, new Date().getFullYear())}
              className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md"
            >
              Mes Actual
            </button>
          </div>
        </div>
      </div>
      
      {/* Contenido del reporte */}
      {renderReporteContenido()}
    </div>
  );
};

export default Reportes;
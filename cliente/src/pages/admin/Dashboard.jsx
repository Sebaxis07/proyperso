import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalPedidos: 0,
    totalUsuarios: 0,
    pedidosPendientes: 0,
    totalMontosPedidos: 0
  });
  const [graphData, setGraphData] = useState({
    pedidosMensuales: [],
    productosMasPedidos: [],
    estadoPedidos: [],
    usuariosPorMes: []
  });
  const [reporteMensual, setReporteMensual] = useState({
    montoPedidosMes: 0,
    pedidosMes: 0,
    clientesNuevosMes: 0,
    ticketPromedio: 0,
    productosMasPedidosMes: [],
    comparacionMesAnterior: {
      pedidos: 0,
      porcentaje: 0
    }
  });
  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No estás autenticado');
        }
        
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
    
        const [productos, pedidos, usuarios] = await Promise.all([
          axios.get('/api/productos', config),
          axios.get('/api/pedidos', config),
          axios.get('/api/usuarios', config)
        ]);
        
        console.log("Datos de pedidos:", pedidos.data);
        console.log("Estructura de un pedido:", pedidos.data.data.length > 0 ? pedidos.data.data[0] : "No hay pedidos");
        
        const pedidosList = pedidos.data.data || [];
        const pedidosPendientes = pedidosList.filter(
          pedido => pedido.estadoPedido === 'pendiente'
        ).length;
    
        const totalMontosPedidos = pedidosList.reduce(
          (total, pedido) => total + (pedido.precioTotal || pedido.total || 0), 
          0
        );
    
        const pedidosPorMes = procesarPedidosMensuales(pedidosList);
        
        const topProductos = procesarProductosMasPedidos(pedidosList);
        
        const estadoPedidosData = procesarEstadoPedidos(pedidosList);
        
        const usuariosPorMes = procesarUsuariosPorMes(pedidosList, usuarios.data.data || []);
        
        const reporteMes = generarReporteMensual(pedidosList, usuarios.data.data || []);
        
        const ultimos = pedidosList.sort((a, b) => 
          new Date(b.fechaCreacion || b.createdAt || b.fecha) - new Date(a.fechaCreacion || a.createdAt || a.fecha)
        ).slice(0, 5);
    
        setStats({
          totalProductos: productos.data.total || 0,
          totalPedidos: pedidos.data.count || 0,
          totalUsuarios: usuarios.data.count || 0,
          pedidosPendientes,
          totalMontosPedidos
        });
        
        setGraphData({
          pedidosMensuales: pedidosPorMes,
          productosMasPedidos: topProductos,
          estadoPedidos: estadoPedidosData,
          usuariosPorMes: usuariosPorMes
        });
        
        setReporteMensual(reporteMes);
        setUltimosPedidos(ultimos);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
        setError('Error al cargar las estadísticas. Por favor, intenta nuevamente más tarde.');
        setLoading(false);
      }
    };
    
    const procesarPedidosMensuales = (pedidos) => {
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const pedidosPorMes = Array(12).fill().map((_, i) => ({
        name: meses[i],
        montos: 0,
        cantidad: 0
      }));
      
      pedidos.forEach(pedido => {
        const fechaPedido = pedido.fechaCreacion || pedido.createdAt || pedido.fecha;
        if (fechaPedido) {
          const fecha = new Date(fechaPedido);
          const mesIndex = fecha.getMonth();
          
          const monto = pedido.precioTotal || pedido.total || 0;
          
          pedidosPorMes[mesIndex].montos += monto;
          pedidosPorMes[mesIndex].cantidad += 1;
        }
      });
      
      return pedidosPorMes.filter(mes => mes.cantidad > 0);
    };
    
    const procesarProductosMasPedidos = (pedidos) => {
      const productosCount = {};
      
      pedidos.forEach(pedido => {
        const itemsPedido = pedido.items || pedido.productos || [];
        
        if (Array.isArray(itemsPedido)) {
          itemsPedido.forEach(item => {
            const productoId = 
              (item.producto && typeof item.producto === 'object') ? item.producto._id : 
              item.productoId || item.producto || 'desconocido';
            
            const nombre = 
              (item.producto && typeof item.producto === 'object') ? item.producto.nombre : 
              item.nombre || 'Producto';
            
            const cantidad = item.cantidad || 1;
            
            if (!productosCount[productoId]) {
              productosCount[productoId] = {
                name: nombre,
                value: 0
              };
            }
            
            productosCount[productoId].value += cantidad;
          });
        }
      });
      
      
      
      return Object.values(productosCount)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    };
    const capitalizarPrimeraLetra = (texto) => {
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    };
    const procesarUsuariosPorMes = (pedidos, usuarios) => {
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const usuariosPorMes = Array(12).fill().map((_, i) => ({
        name: meses[i],
        nuevos: 0,
        recurrentes: 0
      }));
      
      usuarios.forEach(usuario => {
        const fechaRegistro = new Date(usuario.fechaCreacion || usuario.createdAt || usuario.fecha);
        if (isNaN(fechaRegistro.getTime())) return; 
        const mesActual = new Date().getMonth();
        const anioActual = new Date().getFullYear();
        
        if (fechaRegistro.getFullYear() === anioActual && fechaRegistro.getMonth() <= mesActual) {
          usuariosPorMes[fechaRegistro.getMonth()].nuevos += 1;
        }
      });
      
      const clientesPorMes = {};
      
      pedidos.forEach(pedido => {
        const fechaPedido = new Date(pedido.fechaCreacion || pedido.createdAt || pedido.fecha);
        if (isNaN(fechaPedido.getTime())) return; 
        
        if (pedido.usuario) {
          const mesActual = new Date().getMonth();
          const anioActual = new Date().getFullYear();
          
          if (fechaPedido.getFullYear() === anioActual && fechaPedido.getMonth() <= mesActual) {
            const mesIndex = fechaPedido.getMonth();
            const userId = typeof pedido.usuario === 'object' ? pedido.usuario._id : pedido.usuario;
            
            if (!clientesPorMes[mesIndex]) {
              clientesPorMes[mesIndex] = new Set();
            }
            
            if (userId) {
              clientesPorMes[mesIndex].add(userId);
            }
          }
        }
      });
      
      Object.entries(clientesPorMes).forEach(([mesIndex, usuarios]) => {
        usuariosPorMes[mesIndex].recurrentes = usuarios.size;
      });
      
      return usuariosPorMes.filter(mes => mes.nuevos > 0 || mes.recurrentes > 0);
    };
    
    const procesarEstadoPedidos = (pedidos) => {
      const estados = {};
      
      pedidos.forEach(pedido => {
        const estado = pedido.estadoPedido || 'pendiente';
        
        if (!estados[estado]) {
          estados[estado] = {
            name: capitalizarPrimeraLetra(estado),
            value: 0
          };
        }
        
        estados[estado].value += 1;
      });
      
      
      return Object.values(estados);
    };
    
    const generarReporteMensual = (pedidos, usuarios) => {
      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth();
      const anioActual = fechaActual.getFullYear();
      
      const pedidosMesActual = pedidos.filter(pedido => {
        const fechaPedido = new Date(pedido.fechaCreacion || pedido.createdAt || pedido.fecha);
        return fechaPedido.getMonth() === mesActual && fechaPedido.getFullYear() === anioActual;
      });
      
      const montoPedidosMes = pedidosMesActual.reduce((total, pedido) => {
        return total + (pedido.precioTotal || pedido.total || 0);
      }, 0);
      
      const pedidosMes = pedidosMesActual.length;
      
      const ticketPromedio = pedidosMes > 0 ? montoPedidosMes / pedidosMes : 0;
      
      const clientesNuevosMes = usuarios.filter(usuario => {
        if (!usuario.fechaCreacion && !usuario.createdAt) return false;
        const fechaRegistro = new Date(usuario.fechaCreacion || usuario.createdAt);
        return fechaRegistro.getMonth() === mesActual && fechaRegistro.getFullYear() === anioActual;
      }).length;
      
      const productosMesActual = {};
      pedidosMesActual.forEach(pedido => {
        const itemsPedido = pedido.items || pedido.productos || [];
        
        if (Array.isArray(itemsPedido)) {
          itemsPedido.forEach(item => {
            const productoId = 
              (item.producto && typeof item.producto === 'object') ? item.producto._id : 
              item.productoId || item.producto || 'desconocido';
            
            const nombre = 
              (item.producto && typeof item.producto === 'object') ? item.producto.nombre : 
              item.nombre || 'Producto';
            
            const cantidad = item.cantidad || 1;
            const precio = item.precio || item.precioUnitario || 0;
            
            if (!productosMesActual[productoId]) {
              productosMesActual[productoId] = {
                name: nombre,
                value: 0,
                montos: 0
              };
            }
            
            productosMesActual[productoId].value += cantidad;
            productosMesActual[productoId].montos += precio * cantidad;
          });
        }
      });
      
      const topProductosMes = Object.values(productosMesActual)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
      const anioMesAnterior = mesActual === 0 ? anioActual - 1 : anioActual;
      
      const pedidosMesAnterior = pedidos.filter(pedido => {
        const fechaPedido = new Date(pedido.fechaCreacion || pedido.createdAt || pedido.fecha);
        return fechaPedido.getMonth() === mesAnterior && fechaPedido.getFullYear() === anioMesAnterior;
      });
      
      const montoPedidosMesAnterior = pedidosMesAnterior.reduce((total, pedido) => {
        return total + (pedido.precioTotal || pedido.total || 0);
      }, 0);
      
      let porcentajeCambio = 0;
      if (montoPedidosMesAnterior > 0) {
        porcentajeCambio = ((montoPedidosMes - montoPedidosMesAnterior) / montoPedidosMesAnterior) * 100;
      }
      
      return {
        montoPedidosMes,
        pedidosMes,
        clientesNuevosMes,
        ticketPromedio,
        productosMasPedidosMes: topProductosMes,
        comparacionMesAnterior: {
          pedidos: montoPedidosMesAnterior,
          porcentaje: porcentajeCambio
        }
      };
    };

    fetchData();
  }, []);

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Productos</h2>
              <p className="text-2xl font-semibold">{stats.totalProductos}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/productos" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Administrar productos →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Pedidos</h2>
              <p className="text-2xl font-semibold">{stats.totalPedidos}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/pedidos" className="text-green-600 hover:text-green-800 text-sm font-medium">
              Administrar pedidos →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Usuarios</h2>
              <p className="text-2xl font-semibold">{stats.totalUsuarios}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/usuarios" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              Administrar usuarios →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Montos Pedidos</h2>
              <p className="text-2xl font-semibold">${stats.totalMontosPedidos.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/reportes" className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
              Ver reportes →
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de pedidos mensuales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Pedidos Mensuales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graphData.pedidosMensuales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="montos" stroke="#8884d8" activeDot={{ r: 8 }} name="Montos ($)" />
              <Line type="monotone" dataKey="cantidad" stroke="#82ca9d" name="Cantidad de Pedidos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Productos Más Pedidos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graphData.productosMasPedidos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Unidades Pedidas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Usuarios por Mes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={graphData.usuariosPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="recurrentes" stackId="1" stroke="#8884d8" fill="#8884d8" name="Clientes Recurrentes" />
              <Area type="monotone" dataKey="nuevos" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Clientes Nuevos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Estado de Pedidos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={graphData.estadoPedidos} 
                cx="50%" 
                cy="50%" 
                labelLine={false}
                outerRadius={100} 
                fill="#8884d8" 
                dataKey="value"
                nameKey="name"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {graphData.estadoPedidos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Reporte Mensual ({new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()})
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-sm text-gray-500 font-medium">Montos de Pedidos del Mes</h3>
                <p className="text-2xl font-bold">${reporteMensual.montoPedidosMes.toLocaleString()}</p>
                <div className={`flex items-center mt-2 text-sm ${reporteMensual.comparacionMesAnterior.porcentaje >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{reporteMensual.comparacionMesAnterior.porcentaje >= 0 ? '↑' : '↓'} {Math.abs(reporteMensual.comparacionMesAnterior.porcentaje).toFixed(1)}%</span>
                  <span className="ml-1 text-gray-500">vs mes anterior</span>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-sm text-gray-500 font-medium">Cantidad de Pedidos del Mes</h3>
                <p className="text-2xl font-bold">{reporteMensual.pedidosMes}</p>
              </div>
              
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-sm text-gray-500 font-medium">Ticket Promedio</h3>
                <p className="text-2xl font-bold">${reporteMensual.ticketPromedio.toFixed(2)}</p>
              </div>
              
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-sm text-gray-500 font-medium">Clientes Nuevos</h3>
                <p className="text-2xl font-bold">{reporteMensual.clientesNuevosMes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-md font-medium mb-4">Productos Más Pedidos del Mes</h3>
            <div className="space-y-2">
              {reporteMensual.productosMasPedidosMes.map((producto, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-medium">{producto.name}</p>
                    <p className="text-sm text-gray-500">{producto.value} unidades</p>
                  </div>
                  <p className="font-medium">${producto.montos.toLocaleString()}</p>
                </div>
              ))}
              
              {reporteMensual.productosMasPedidosMes.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay datos de pedidos para este mes</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-right">
          <Link to="/admin/reportes" className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center justify-end">
            <span>Ver reporte completo</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Acciones rápidas</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/productos/nuevo" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-md border border-gray-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nuevo producto</span>
          </Link>
          
          <Link to="/admin/pedidos?estado=pendiente" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-md border border-gray-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Gestionar pedidos</span>
          </Link>
          
          <Link to="/admin/productos?stock=bajo" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-md border border-gray-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Stock bajo</span>
          </Link>
          
          <Link to="/admin/usuarios/nuevo" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-md border border-gray-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Crear usuario</span>
          </Link>
        </div>
      </div>
      
      
    </div>
  );
};

export default AdminDashboard;
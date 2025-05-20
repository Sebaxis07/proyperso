// cliente/src/App.jsx - Modificación
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SocketProvider } from './context/SocketContext';

import AuthProvider from './context/AuthContext';
import CartProvider from './context/CartContext';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Chatbot from './components/chatbot/Chatbot'; // Importar el componente Chatbot
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Contacto from './pages/Contacto';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Nosotros from './pages/Nosotros';
import NotFound from './pages/NotFound';
import ConfirmacionReserva from './pages/ConfirmacionReserva';

// Páginas de Administración
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import ProductForm from './pages/admin/ProductForm';
import NuevoUsuario from './pages/admin/Nuevo';
import Reportes from './pages/admin/Reportes';
import AdminEmpleados from './pages/admin/Empleados';
import DetalleEmpleado from './pages/admin/DetalleEmpleado';
import SolicitudesCancelacion from './pages/admin/SolicitudesCancelacion';
import axios from 'axios';

// Componentes de empleados
import EmpleadoDashboard from './pages/empleados/Dashboard';
import ListaPedidos from './pages/empleados/ListaPedidos';
import GestionPedido from './pages/empleados/GestionPedido';

// Rutas protegidas adicionales
import EmpleadoRoute from './components/routing/EmpleadoRoute';

// Base URL para axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Interceptores de axios para agregar el token y manejar errores 401
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/productos" element={<Products />} />
                  <Route path="/productos/:id" element={<ProductDetail />} />
                  <Route path="/carrito" element={<Cart />} />
                  <Route path="/nosotros" element={<Nosotros />} />
                  <Route path="/contacto" element={<Contacto />} />
                  
                  {/* Rutas protegidas (usuario) */}
                  <Route path="/checkout" element={
                    <PrivateRoute>
                      <Checkout />
                    </PrivateRoute>
                  } />
                  {/* Nueva ruta para reportes */}
                    <Route path="/admin/reportes" element={
                      <AdminRoute>
                        <Reportes />
                      </AdminRoute>
                    } />
                  <Route path="/perfil" element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } />
                  <Route path="/pedidos" element={
                    <PrivateRoute>
                      <Orders />
                    </PrivateRoute>
                  } />
                  <Route path="/confirmacion-reserva/:id" element={
                    <PrivateRoute>
                      <ConfirmacionReserva />
                    </PrivateRoute>
                  } />
                  <Route path="/pedidos/:id" element={
                    <PrivateRoute>
                      <OrderDetail />
                    </PrivateRoute>
                  } />
                  
                  {/* Rutas de administración */}
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/admin/productos" element={
                    <AdminRoute>
                      <AdminProducts />
                    </AdminRoute>
                  } />
                  <Route path="/admin/pedidos" element={
                    <AdminRoute>
                      <AdminOrders />
                    </AdminRoute>
                  } />
                  <Route path="/admin/usuarios" element={
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  } />
                  <Route path="/admin/usuarios/nuevo" element={
                    <AdminRoute>
                      <NuevoUsuario />
                    </AdminRoute>
                  } />
                  <Route path="/admin/productos/nuevo" element={
                    <AdminRoute>
                      <ProductForm />
                    </AdminRoute>
                  } />
                  <Route path="/admin/productos/:id/editar" element={
                    <AdminRoute>
                      <ProductForm />
                    </AdminRoute>
                  } />
                  <Route path="/admin/empleados" element={
                    <AdminRoute>
                      <AdminEmpleados />
                    </AdminRoute>
                  } />
                  <Route path="/admin/empleados/:id" element={
                    <AdminRoute>
                      <DetalleEmpleado />
                    </AdminRoute>
                  } />
                  <Route path="/admin/solicitudes" element={
                    <AdminRoute>
                      <SolicitudesCancelacion />
                    </AdminRoute>
                  } />

                  {/* Rutas para empleados */}
                  <Route path="/empleado/dashboard" element={
                    <EmpleadoRoute>
                      <EmpleadoDashboard />
                    </EmpleadoRoute>
                  } />
                  <Route path="/empleado/pedidos" element={
                    <EmpleadoRoute>
                      <ListaPedidos />
                    </EmpleadoRoute>
                  } />
                  <Route path="/empleado/pedidos/:id" element={
                    <EmpleadoRoute>
                      <GestionPedido />
                    </EmpleadoRoute>
                  } />

                  {/* Ruta 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              {/* Componente Chatbot - Se muestra en todas las páginas */}
              <Chatbot />
            </div>
          </Router>
          <ToastContainer position="bottom-right" />
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
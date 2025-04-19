// cliente/src/pages/admin/Users.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Estado para cambio de rol
  const [changingRoleUserId, setChangingRoleUserId] = useState(null);
  const [newRole, setNewRole] = useState('');

  // Opciones para filtro de rol
  const roles = [
    { id: '', nombre: 'Todos los roles' },
    { id: 'cliente', nombre: 'Cliente' },
    { id: 'admin', nombre: 'Administrador' }
  ];

  useEffect(() => {
    const fetchUsuarios = async () => {
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

        const res = await axios.get('/api/usuarios', config);
        setUsuarios(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setError('Error al cargar los usuarios. Por favor, intenta nuevamente más tarde.');
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
    const matchNombre = nombreCompleto.includes(filtroNombre.toLowerCase()) || 
                        usuario.email.toLowerCase().includes(filtroNombre.toLowerCase()) ||
                        usuario.rut.includes(filtroNombre);
    const matchRol = filtroRol === '' || usuario.rol === filtroRol;
    
    return matchNombre && matchRol;
  });

  // Eliminar usuario
  const handleDeleteUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.delete(`/api/usuarios/${id}`, config);
      
      // Actualizar la lista de usuarios
      setUsuarios(usuarios.filter(usuario => usuario._id !== id));
      
      // Cerrar modal de confirmación
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      alert('Error al eliminar el usuario. Por favor, intenta nuevamente.');
    }
  };

  // Cambiar rol de usuario
  const handleChangeRole = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.put(`/api/usuarios/${userId}/rol`, { rol: newRole }, config);
      
      // Actualizar la lista de usuarios
      setUsuarios(usuarios.map(usuario => {
        if (usuario._id === userId) {
          return { ...usuario, rol: newRole };
        }
        return usuario;
      }));
      
      // Cerrar edición
      setChangingRoleUserId(null);
    } catch (err) {
      console.error('Error al cambiar el rol:', err);
      alert('Error al cambiar el rol del usuario. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Administrar Usuarios</h1>
        
        <Link 
          to="/admin/usuarios/nuevo" 
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Nuevo Usuario
        </Link>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="filtroNombre" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nombre, email o RUT
            </label>
            <input
              type="text"
              id="filtroNombre"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              placeholder="Buscar usuarios..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor="filtroRol" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por rol
            </label>
            <select
              id="filtroRol"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {roles.map(rol => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Mensajes de estado */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No se encontraron usuarios</h2>
            <p className="text-gray-600 mb-6">Intenta con otros criterios de búsqueda o agrega nuevos usuarios.</p>
          </div>
          <Link to="/admin/usuarios/nuevo" className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md">
            Agregar Usuario
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RUT
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de registro
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-600">
                            {usuario.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.nombre} {usuario.apellido}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usuario.email}</div>
                      <div className="text-sm text-gray-500">{usuario.telefono || 'No especificado'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usuario.rut}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {changingRoleUserId === usuario._id ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="text-sm border-gray-300 rounded-md"
                          >
                            <option value="cliente">Cliente</option>
                            <option value="admin">Administrador</option>
                          </select>
                          <button
                            onClick={() => handleChangeRole(usuario._id)}
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setChangingRoleUserId(null)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          usuario.rol === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {usuario.rol === 'admin' ? 'Administrador' : 'Cliente'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(usuario.createdAt).toLocaleDateString('es-CL')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        {changingRoleUserId !== usuario._id && (
                          <button
                            onClick={() => {
                              setChangingRoleUserId(usuario._id);
                              setNewRole(usuario.rol);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Cambiar rol
                          </button>
                        )}
                        <Link 
                          to={`/admin/usuarios/${usuario._id}`} 
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Ver
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(usuario._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación para eliminar */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Confirmar eliminación</h3>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteUser(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
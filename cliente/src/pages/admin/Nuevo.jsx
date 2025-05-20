import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NuevoUsuario = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rut: '',
    password: '',
    telefono: '',
    direccion: {
      calle: '',
      numero: '',
      comuna: '',
      ciudad: '',
      region: ''
    },
    rol: 'cliente'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/usuarios', formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      navigate('/admin/usuarios');
    } catch (error) {
      setError(error.response?.data?.msg || 'Error al crear usuario');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-8 h-8 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v3h16v-3c0-2.663-5.33-4-8-4z" />
        </svg>
        <h2 className="text-3xl font-bold text-gray-800">Crear Nuevo Usuario</h2>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">RUT</label>
            <input
              type="text"
              name="rut"
              value={formData.rut}
              onChange={handleChange}
              className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h2m4 0h10m-6-6v12" />
            </svg>
            Dirección
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Calle</label>
              <input
                type="text"
                name="direccion.calle"
                value={formData.direccion.calle}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Número</label>
              <input
                type="text"
                name="direccion.numero"
                value={formData.direccion.numero}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Comuna</label>
              <input
                type="text"
                name="direccion.comuna"
                value={formData.direccion.comuna}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                name="direccion.ciudad"
                value={formData.direccion.ciudad}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Región</label>
              <input
                type="text"
                name="direccion.region"
                value={formData.direccion.region}
                onChange={handleChange}
                className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Rol</label>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
            required
          >
            <option value="cliente">Cliente</option>
            <option value="empleado">Empleado</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {formData.rol === 'empleado' && (
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Información Laboral
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={formData.fechaInicio || ''}
                  onChange={handleChange}
                  className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Turno</label>
                <select
                  name="turno"
                  value={formData.turno || 'mañana'}
                  onChange={handleChange}
                  className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
                >
                  <option value="mañana">Mañana</option>
                  <option value="tarde">Tarde</option>
                  <option value="noche">Noche</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/usuarios')}
            className="px-5 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-[#FFD15C] hover:bg-[#FFC132] text-white font-bold rounded-lg shadow transition-all duration-300"
          >
            Crear Usuario
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoUsuario;
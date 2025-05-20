import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const DetalleEmpleado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    turno: '',
    activo: true
  });

  useEffect(() => {
    fetchEmpleado();
  }, [id]);

  const fetchEmpleado = async () => {
    try {
      const res = await axios.get(`/api/usuarios/${id}`);
      setEmpleado(res.data.data);
      setFormData({
        nombre: res.data.data.nombre,
        apellido: res.data.data.apellido,
        email: res.data.data.email,
        telefono: res.data.data.telefono,
        turno: res.data.data.turno,
        activo: res.data.data.activo
      });
      setLoading(false);
    } catch (err) {
      toast.error('Error al cargar datos del empleado');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/usuarios/${id}`, formData);
      toast.success('Empleado actualizado correctamente');
      setEditMode(false);
      fetchEmpleado();
    } catch (err) {
      toast.error('Error al actualizar empleado');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Detalle del Empleado
            </h1>
            <div className="flex gap-2">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Editar
                </button>
              ) : (
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD15C] focus:ring-[#FFD15C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD15C] focus:ring-[#FFD15C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD15C] focus:ring-[#FFD15C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD15C] focus:ring-[#FFD15C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Turno
                  </label>
                  <select
                    name="turno"
                    value={formData.turno}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD15C] focus:ring-[#FFD15C]"
                  >
                    <option value="mañana">Mañana</option>
                    <option value="tarde">Tarde</option>
                    <option value="noche">Noche</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-[#FFD15C] focus:ring-[#FFD15C]"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Empleado activo
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#FFD15C] hover:bg-[#FFC132] text-white px-6 py-2 rounded"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                <p className="mt-1 text-lg">{empleado.nombre}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Apellido</h3>
                <p className="mt-1 text-lg">{empleado.apellido}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-lg">{empleado.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                <p className="mt-1 text-lg">{empleado.telefono}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Turno</h3>
                <p className="mt-1 text-lg capitalize">{empleado.turno}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                <p className="mt-1">
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    empleado.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {empleado.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalleEmpleado;
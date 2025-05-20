import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SolicitudesCancelacion = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      const res = await axios.get('/api/pedidos/solicitudes-cancelacion');
      setSolicitudes(res.data.data);
      setLoading(false);
    } catch (err) {
      toast.error('Error al cargar solicitudes');
      setLoading(false);
    }
  };

  const handleAprobar = async (solicitudId) => {
    try {
      await axios.post(`/api/pedidos/solicitudes-cancelacion/${solicitudId}/aprobar`);
      toast.success('Solicitud aprobada');
      fetchSolicitudes();
    } catch (err) {
      toast.error('Error al aprobar solicitud');
    }
  };

  const handleRechazar = async (solicitudId) => {
    try {
      await axios.post(`/api/pedidos/solicitudes-cancelacion/${solicitudId}/rechazar`);
      toast.success('Solicitud rechazada');
      fetchSolicitudes();
    } catch (err) {
      toast.error('Error al rechazar solicitud');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Solicitudes de Cancelación</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {solicitudes.map((solicitud) => (
          <div key={solicitud._id} className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  Pedido #{solicitud.pedido.numeroPedido}
                </h3>
                <p className="text-gray-600">
                  Solicitado por: {solicitud.empleado.nombre} {solicitud.empleado.apellido}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Fecha de solicitud: {new Date(solicitud.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAprobar(solicitud._id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleRechazar(solicitud._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {solicitudes.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No hay solicitudes de cancelación pendientes
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudesCancelacion;
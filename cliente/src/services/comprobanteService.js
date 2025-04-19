// src/services/comprobanteService.js
import axios from 'axios';

const API_URL = '/api';

export const comprobanteService = {
  // Obtener un comprobante por su ID
  getComprobanteById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/comprobantes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el comprobante:', error);
      throw error;
    }
  },
  
  // Obtener lista de comprobantes (para mostrar en una tabla)
  getComprobantes: async (filtros = {}) => {
    try {
      const response = await axios.get(`${API_URL}/comprobantes`, { params: filtros });
      return response.data;
    } catch (error) {
      console.error('Error al obtener comprobantes:', error);
      throw error;
    }
  },
  
  // Generar un nuevo comprobante (si necesitas esta funcionalidad)
  createComprobante: async (comprobanteData) => {
    try {
      const response = await axios.post(`${API_URL}/comprobantes`, comprobanteData);
      return response.data;
    } catch (error) {
      console.error('Error al crear comprobante:', error);
      throw error;
    }
  }
};

export default comprobanteService;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { saveAs } from 'file-saver';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const ComprobanteDownload = ({ comprobanteId }) => {
  const [comprobante, setComprobante] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (comprobanteId) {
      fetchComprobante();
    }
  }, [comprobanteId]);

  const fetchComprobante = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/comprobantes/${comprobanteId}`);
      setComprobante(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el comprobante');
      console.error('Error al cargar el comprobante:', err);
    } finally {
      setLoading(false);
    }
  };

  const generarDefinicionPDF = () => {
    if (!comprobante) return null;

    return {
      content: [
        { text: 'COMPROBANTE DE PAGO', style: 'header' },
        { text: `Número: ${comprobante.numero || ''}`, margin: [0, 20, 0, 10] },
        { text: `Fecha: ${new Date(comprobante.fecha).toLocaleDateString()}`, margin: [0, 0, 0, 10] },
        { text: `Cliente: ${comprobante.cliente?.nombre || ''}`, margin: [0, 0, 0, 10] },
        { text: `Total: $${comprobante.total?.toFixed(2) || '0.00'}`, margin: [0, 0, 0, 10] },
        
        comprobante.detalles?.length > 0 ? {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['Descripción', 'Cantidad', 'Precio Unitario', 'Subtotal'],
              ...comprobante.detalles.map(item => [
                item.descripcion || '',
                item.cantidad?.toString() || '',
                `$${item.precioUnitario?.toFixed(2) || '0.00'}`,
                `$${item.subtotal?.toFixed(2) || '0.00'}`
              ])
            ]
          },
          margin: [0, 20, 0, 20]
        } : {},
        
        { text: 'Gracias por su compra', style: 'footer' }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        footer: {
          fontSize: 10,
          italic: true,
          alignment: 'center',
          margin: [0, 30, 0, 0]
        }
      }
    };
  };

  const descargarComprobante = () => {
    if (!comprobante) return;
    
    const docDefinition = generarDefinicionPDF();
    if (!docDefinition) return;
    
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    
    pdfDocGenerator.getBlob((blob) => {
      saveAs(blob, `comprobante-${comprobante.numero || comprobanteId}.pdf`);
    });
  };

  return (
    <div className="comprobante-download">
      {loading && <p>Cargando comprobante...</p>}
      {error && <p className="error">{error}</p>}
      {comprobante && (
        <button 
          onClick={descargarComprobante}
          disabled={loading}
          className="download-button"
        >
          Descargar Comprobante
        </button>
      )}
    </div>
  );
};

export default ComprobanteDownload;
// cliente/src/pages/OrderDetail.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pdfRef = useRef(null);
  
  // Estado para la subida del comprobante
  const [comprobante, setComprobante] = useState('');
  const [subiendoComprobante, setSubiendoComprobante] = useState(false);
  const [errorComprobante, setErrorComprobante] = useState(null);
  const [comprobanteSubido, setComprobanteSubido] = useState(false);
  
  // Estado para seguimiento de envío
  const [seguimiento, setSeguimiento] = useState(null);
  const [viewHistory, setViewHistory] = useState(false);
  
  // Estado para feedback
  const [feedback, setFeedback] = useState({
    rating: 0,
    comentario: ''
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const fetchPedido = async () => {
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

        const res = await axios.get(`/api/pedidos/${id}`, config);
        setPedido(res.data.data);
        
        // Simular información de seguimiento para pedidos enviados
        if (res.data.data.estadoPedido === 'enviado') {
          setSeguimiento({
            numeroSeguimiento: 'SP' + Math.floor(Math.random() * 10000000),
            empresa: 'Starken',
            fechaEnvio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            urlSeguimiento: 'https://www.starken.cl/seguimiento',
            estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            historia: [
              { fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), estado: 'Pedido recibido en centro de distribución' },
              { fecha: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), estado: 'En proceso de despacho' },
              { fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), estado: 'En ruta hacia destino' },
              { fecha: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), estado: 'En sucursal de destino' },
              { fecha: new Date(), estado: 'En reparto final' }
            ]
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el pedido:', err);
        setError(err.response?.data?.msg || 'Error al cargar el pedido');
        setLoading(false);
      }
    };

    fetchPedido();
  }, [id]);


  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  // Formatear fecha
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return 'Fecha no disponible';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear fecha corta
  const formatFechaCorta = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Manejar cambio en campo de comprobante
  const handleComprobanteChange = (e) => {
    setComprobante(e.target.value);
    setErrorComprobante(null);
  };

  // Manejar subida de comprobante
  const handleSubirComprobante = async () => {
    if (!comprobante.trim()) {
      setErrorComprobante('Por favor ingresa la URL o número del comprobante');
      return;
    }

    try {
      setSubiendoComprobante(true);
      setErrorComprobante(null);
      
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.put(
        `/api/pedidos/${id}/comprobante`,
        { urlComprobante: comprobante },
        config
      );

      // Actualizar el estado del pedido
      setPedido(prev => ({
        ...prev,
        comprobantePago: comprobante,
        estadoPago: 'pendiente'
      }));
      
      setComprobanteSubido(true);
      setSubiendoComprobante(false);
    } catch (err) {
      console.error('Error al subir el comprobante:', err);
      setErrorComprobante(err.response?.data?.msg || 'Error al subir el comprobante');
      setSubiendoComprobante(false);
    }
  };

  // Manejar cancelación de pedido
  const handleCancelarPedido = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.put(`/api/pedidos/${id}/cancelar`, {}, config);

      // Actualizar el estado del pedido
      setPedido(prev => ({
        ...prev,
        estadoPedido: 'cancelado'
      }));
      
      setLoading(false);
    } catch (err) {
      console.error('Error al cancelar el pedido:', err);
      setError(err.response?.data?.msg || 'Error al cancelar el pedido');
      setLoading(false);
    }
  };

  // Enviar valoración del pedido
  const handleSubmitFeedback = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.post(`/api/pedidos/${id}/feedback`, feedback, config);
      
      setFeedbackSubmitted(true);
      setLoading(false);
    } catch (err) {
      console.error('Error al enviar valoración:', err);
      setError(err.response?.data?.msg || 'Error al enviar valoración');
      setLoading(false);
    }
  };

  // Actualizar estado de feedback
  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedback({
      ...feedback,
      [name]: value
    });
  };

  // Actualizar rating
  const handleRatingChange = (rating) => {
    setFeedback({
      ...feedback,
      rating
    });
  };

  // Obtener el color y texto del estado de pedido
  const getEstadoPedidoInfo = (estado) => {
    const estados = {
      pendiente: { 
        color: 'yellow', 
        text: 'Pendiente',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      procesando: { 
        color: 'blue', 
        text: 'Procesando',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        )
      },
      enviado: { 
        color: 'purple', 
        text: 'Enviado',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        )
      },
      entregado: { 
        color: 'green', 
        text: 'Entregado',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      },
      cancelado: { 
        color: 'red', 
        text: 'Cancelado',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      }
    };
    
    return estados[estado] || { color: 'gray', text: estado };
  };

  // Obtener el color y texto del estado de pago
  const getEstadoPagoInfo = (estado) => {
    const estados = {
      pendiente: { 
        color: 'yellow', 
        text: 'Pendiente de verificación',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      pagado: { 
        color: 'green', 
        text: 'Pagado',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      rechazado: { 
        color: 'red', 
        text: 'Rechazado',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    };
    
    return estados[estado] || { color: 'gray', text: estado };
  };

  // Obtener los pasos de progreso del pedido
  const getProgresoSteps = () => {
    const steps = [
      { id: 'pendiente', title: 'Pendiente', description: 'Pedido recibido' },
      { id: 'procesando', title: 'Procesando', description: 'Preparando productos' },
      { id: 'enviado', title: 'Enviado', description: 'En camino' },
      { id: 'entregado', title: 'Entregado', description: 'Recibido' }
    ];
    
    // Identificar cuál es el paso actual y obtener su índice
    const currentStepIndex = steps.findIndex(step => step.id === pedido.estadoPedido);
    const isCompleted = pedido.estadoPedido === 'entregado';
    const isCancelled = pedido.estadoPedido === 'cancelado';
    
    return { steps, currentStepIndex, isCompleted, isCancelled };
  };

  // Generar PDF mejorado con jsPDF (este método generará un PDF mucho más profesional)
  const generatePDF = async () => {
    try {
      // Crear instancia PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20; // Posición inicial Y
      const margin = 10;
  
      // Agregar logo y título
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor("#222");
      doc.text("PetShop", margin, yPos);
  
      doc.setFontSize(10);
      doc.setTextColor("#666");
      doc.text("www.petshop.cl | contacto@petshop.cl", pageWidth - margin, yPos, { align: "right" });
      
      yPos += 15;
      
      // Agregar detalles del pedido
      doc.setFontSize(16);
      doc.setTextColor("#222");
      doc.text(`Detalles del Pedido #${pedido.numeroPedido || id.substring(0, 8)}`, margin, yPos);
      
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setTextColor("#555");
      doc.text(`Fecha: ${formatFecha(pedido.createdAt)}`, margin, yPos);
      
      yPos += 6;
      
      // Estado del pedido
      const estadoPedidoInfo = getEstadoPedidoInfo(pedido.estadoPedido);
      const estadoPagoInfo = getEstadoPagoInfo(pedido.estadoPago);
      
      doc.text(`Estado del pedido: ${estadoPedidoInfo.text}`, margin, yPos);
      
      yPos += 6;
      
      doc.text(`Estado del pago: ${estadoPagoInfo.text}`, margin, yPos);
      
      yPos += 15;
      
      // Información de envío
      doc.setFontSize(14);
      doc.setTextColor("#222");
      doc.text("Dirección de Envío", margin, yPos);
      
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setTextColor("#555");
      doc.text(`${pedido.direccionEnvio.calle} ${pedido.direccionEnvio.numero}`, margin, yPos);
      
      yPos += 6;
      
      doc.text(`${pedido.direccionEnvio.comuna}, ${pedido.direccionEnvio.ciudad}`, margin, yPos);
      
      yPos += 6;
      
      doc.text(`${pedido.direccionEnvio.region}`, margin, yPos);
      
      if (pedido.direccionEnvio.codigoPostal) {
        yPos += 6;
        doc.text(`Código Postal: ${pedido.direccionEnvio.codigoPostal}`, margin, yPos);
      }
      
      yPos += 15;
      
      // Método de pago
      doc.setFontSize(14);
      doc.setTextColor("#222");
      doc.text("Método de Pago", margin, yPos);
      
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setTextColor("#555");
      let metodoPagoText = "Desconocido";
      if (pedido.metodoPago === 'webpay') metodoPagoText = "WebPay (Tarjeta)";
      if (pedido.metodoPago === 'transferencia') metodoPagoText = "Transferencia Bancaria";
      if (pedido.metodoPago === 'efectivo') metodoPagoText = "Efectivo al recibir";
      
      doc.text(metodoPagoText, margin, yPos);
      
      yPos += 15;
      
      // Tabla de productos
      doc.setFontSize(14);
      doc.setTextColor("#222");
      doc.text("Productos", margin, yPos);
      
      yPos += 10;
      
      // Crear datos para la tabla
      const tableHeaders = [['Producto', 'Precio', 'Cantidad', 'Subtotal']];
      const tableData = pedido.productos.map((item) => [
        item.producto?.nombre || "Producto eliminado",
        formatPrice(item.precioUnitario),
        item.cantidad.toString(),
        formatPrice(item.subtotal)
      ]);
      
      // Usar autoTable de manera correcta
      doc.autoTable({
        startY: yPos,
        head: tableHeaders,
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [255, 209, 92],
          textColor: [50, 50, 50],
          fontStyle: 'bold'
        },
        margin: { left: margin, right: margin }
      });
      
      // Obtener la posición Y después de la tabla
      yPos = doc.lastAutoTable.finalY + 10;
      
      // Tabla de totales
      const totalesData = [
        ['Subtotal', formatPrice(pedido.subtotal)],
        ['Envío', pedido.costoEnvio === 0 ? "GRATIS" : formatPrice(pedido.costoEnvio)],
        ['Total', formatPrice(pedido.total)]
      ];
      
      doc.autoTable({
        startY: yPos,
        body: totalesData,
        theme: 'plain',
        tableWidth: 'auto',
        styles: { cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 50, halign: 'right' }
        },
        margin: { left: pageWidth - 110, right: margin }
      });
      
      // Agregar pie de página
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Página ${i} de ${pageCount} - Documento generado el ${new Date().toLocaleDateString('es-CL')}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }
      
      // Guardar el PDF
      doc.save(`Pedido-${pedido.numeroPedido || id.substring(0, 8)}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      
      // En caso de error con autoTable, intentar con el método de captura alternativo
      console.log('Intentando método alternativo de generación de PDF...');
      generateScreenshotPDF();
    }
  };

  // Versión alternativa usando HTML2Canvas para capturar el diseño exacto
  const generateScreenshotPDF = async () => {
    try {
      const element = document.getElementById('order-detail');
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`Pedido-${pedido.numeroPedido || id.substring(0, 8)}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center py-16 bg-gray-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute top-0 left-0 right-0 bottom-0 animate-spin rounded-full border-4 border-gray-200 border-t-[#FFD15C]"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg className="w-8 h-8 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-700">Error</h2>
          </div>
          <p className="mb-4">{error}</p>
          <Link 
            to="/pedidos" 
            className="inline-flex items-center justify-center px-5 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 font-medium gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a mis pedidos
          </Link>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Pedido no encontrado</h2>
        <p className="text-gray-600 mb-8">No hemos podido encontrar el pedido que estás buscando</p>
        <Link 
          to="/pedidos" 
          className="inline-flex items-center justify-center px-6 py-3 bg-[#FFD15C] hover:bg-[#FFC132] text-white rounded-full shadow-lg transition-all duration-200 font-medium gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  const estadoPedidoInfo = getEstadoPedidoInfo(pedido.estadoPedido);
  const estadoPagoInfo = getEstadoPagoInfo(pedido.estadoPago);
  const { steps, currentStepIndex, isCompleted, isCancelled } = getProgresoSteps();

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <svg className="w-8 h-8 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Detalles del Pedido
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-gray-600">Orden <span className="font-semibold">#{pedido?.numeroPedido || id.substring(0, 8)}</span></p>
              <span className="text-gray-400">•</span>
              <p className="text-gray-600">{formatFecha(pedido?.createdAt)}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={generatePDF}
              className="inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-[#FFD15C] to-[#FFC132] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-medium gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              Descargar PDF
            </button>
            
            <Link 
              to="/pedidos" 
              className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a mis pedidos
            </Link>
          </div>
        </div>

        {/* Barra de progreso del pedido */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Estado de tu Pedido
            </h2>
            
            <div className="relative">
              {/* Línea de conexión */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200">
                <div 
                  className={`h-full bg-[#FFD15C] transition-all duration-500`} 
                  style={{ 
                    width: isCompleted 
                      ? '100%' 
                      : `${(currentStepIndex / (steps.length - 1)) * 100}%` 
                  }}
                ></div>
              </div>
              
              {/* Steps */}
              <div className="relative flex justify-between">
                {steps.map((step, index) => {
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step.id} className="flex-1 text-center">
                      <div className="relative flex flex-col items-center">
                        {/* Dot */}
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center z-10 
                            ${isActive 
                              ? 'bg-[#FFD15C] text-white' 
                              : 'bg-gray-200 text-gray-500'
                            }
                            ${isCurrent ? 'ring-4 ring-[#FFF9E6]' : ''}
                          `}
                        >
                          {isActive && index === steps.length - 1 ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-sm font-bold">{index + 1}</span>
                          )}
                        </div>
                        
                        {/* Label */}
                        <div className="mt-3">
                          <p className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.title}
                          </p>
                          <p className={`text-xs ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Información de seguimiento si está disponible */}
            {seguimiento && (
              <div className="mt-10 pt-6 border-t border-gray-100">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Número de seguimiento</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-semibold text-gray-700">{seguimiento.numeroSeguimiento}</p>
                      <button 
                        onClick={() => navigator.clipboard.writeText(seguimiento.numeroSeguimiento)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Copiar"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Empresa de transporte</p>
                    <p className="font-semibold text-gray-700 mt-1">{seguimiento.empresa}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Fecha estimada de entrega</p>
                    <p className="font-semibold text-gray-700 mt-1">
                      {formatFecha(seguimiento.estimatedDelivery)}
                    </p>
                  </div>
                  
                  <div>
                    <a 
                      href={seguimiento.urlSeguimiento} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium mt-3 md:mt-0"
                    >
                      Ver detalles de envío
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
                
                {/* Historia de seguimiento desplegable */}
                {seguimiento.historia && seguimiento.historia.length > 0 && (
                  <div className="mt-6">
                    <button
                      onClick={() => setViewHistory(!viewHistory)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      <svg className={`w-5 h-5 transition-transform ${viewHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {viewHistory ? 'Ocultar historial' : 'Ver historial de envío'}
                    </button>
                    
                    {viewHistory && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                        {seguimiento.historia.map((evento, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="relative">
                              <div className="w-3 h-3 rounded-full bg-blue-500 absolute -left-5 top-1.5"></div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-800 font-medium">{evento.estado}</p>
                              <p className="text-xs text-gray-500">{formatFechaCorta(evento.fecha)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div id="order-detail" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda: Detalles del pedido y productos */}
          <div className="lg:col-span-2 space-y-8">
            {/* Estado en caso de cancelación */}
            {isCancelled && (
              <div className="bg-red-50 border border-red-100 rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-800">Pedido cancelado</h3>
                    <p className="text-red-600">Este pedido ha sido cancelado y no será procesado.</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Productos */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Productos ({pedido.productos.length})
                </h2>
              </div>
              
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  {pedido.productos.map((item, index) => (
                    <li key={index} className="p-6 hover:bg-gray-50 transition-colors flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {item.producto && item.producto.imagenUrl ? (
                          <img 
                            src={item.producto.imagenUrl} 
                            alt={item.producto?.nombre || "Producto"} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <div>
                            {item.producto && item.producto.nombre ? (
                              <Link 
                                to={`/productos/${item.producto._id}`}
                                className="text-lg font-bold text-gray-800 hover:text-[#FFD15C] transition-colors"
                              >
                                {item.producto.nombre}
                              </Link>
                            ) : (
                              <div className="text-gray-500 font-medium flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Producto no disponible
                              </div>
                            )}
                            
                            {item.producto && item.producto.categorias && (
                              <div className="text-sm text-gray-500 mt-1">
                                {item.producto.categorias.join(", ")}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="font-bold text-gray-800">
                              {formatPrice(item.subtotal)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.cantidad} × {formatPrice(item.precioUnitario)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Sistema de valoración si el pedido está entregado */}
            {pedido.estadoPedido === 'entregado' && !feedbackSubmitted && (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  ¿Cómo valorarías tu experiencia?
                </h2>
                
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center
                          ${feedback.rating >= star 
                            ? 'text-yellow-400 hover:text-yellow-500' 
                            : 'text-gray-300 hover:text-gray-400'}
                        `}
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-1">
                      Comentarios (opcional)
                    </label>
                    <textarea
                      id="comentario"
                      name="comentario"
                      rows="3"
                      value={feedback.comentario}
                      onChange={handleFeedbackChange}
                      placeholder="Cuéntanos tu experiencia con este pedido..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFD15C] focus:border-transparent"
                    ></textarea>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleSubmitFeedback}
                    disabled={!feedback.rating}
                    className="px-5 py-2 bg-[#FFD15C] hover:bg-[#FFC132] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Enviar valoración
                  </button>
                </div>
              </div>
            )}
            
            {/* Mostrar valoración enviada */}
            {feedbackSubmitted && (
              <div className="bg-green-50 rounded-2xl shadow-sm overflow-hidden p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-green-800">¡Gracias por tu valoración!</h3>
                    <p className="text-green-600">Tu opinión es muy importante para seguir mejorando.</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Acciones del pedido */}
            {['pendiente', 'procesando'].includes(pedido.estadoPedido) && (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Acciones</h2>
                
                <button
                  onClick={handleCancelarPedido}
                  className="px-5 py-2 bg-white hover:bg-red-50 text-red-600 font-medium rounded-lg border border-red-300 hover:border-red-400 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar pedido
                </button>
              </div>
            )}
          </div>
          
          {/* Columna derecha: Resumen y detalles */}
          <div className="lg:col-span-1 space-y-8">
            {/* Resumen del pedido */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Resumen del pedido
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(pedido.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    {pedido.costoEnvio === 0 ? (
                      <span className="font-medium text-green-600">GRATIS</span>
                    ) : (
                      <span className="font-medium">{formatPrice(pedido.costoEnvio)}</span>
                    )}
                  </div>
                  
                  <div className="h-px bg-gray-200 my-2"></div>
                  
                  <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-extrabold text-2xl text-[#FFD15C]">{formatPrice(pedido.total)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-600">Estado de pago</span>
                    <div 
                      className={`
                        px-3 py-1 rounded-full text-xs font-semibold 
                        ${estadoPagoInfo.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                        ${estadoPagoInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${estadoPagoInfo.color === 'red' ? 'bg-red-100 text-red-800' : ''}
                      `}
                    >
                      {estadoPagoInfo.text}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Información de envío */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Dirección de Envío
                </h2>
              </div>
              
              <div className="p-6">
                <address className="not-italic space-y-1">
                  <p className="font-medium text-gray-900">
                    {pedido?.direccionEnvio.calle} {pedido?.direccionEnvio.numero}
                    {pedido?.direccionEnvio.departamento && `, ${pedido?.direccionEnvio.departamento}`}
                  </p>
                  <p className="text-gray-600">{pedido?.direccionEnvio.comuna}, {pedido?.direccionEnvio.ciudad}</p>
                  <p className="text-gray-600">{pedido?.direccionEnvio.region}</p>
                  {pedido?.direccionEnvio.codigoPostal && (
                    <p className="text-gray-600">CP: {pedido?.direccionEnvio.codigoPostal}</p>
                  )}
                </address>
              </div>
            </div>
            
            {/* Método de pago */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Método de Pago
                </h2>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                    {pedido?.metodoPago === 'webpay' && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )}
                    {pedido?.metodoPago === 'transferencia' && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                    )}
                    {pedido?.metodoPago === 'efectivo' && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                    )}
                  </div>
                  
                  <div>
                    <p className="capitalize font-medium text-gray-900">
                      {pedido?.metodoPago === 'webpay' && 'WebPay (Tarjeta)'}
                      {pedido?.metodoPago === 'transferencia' && 'Transferencia Bancaria'}
                      {pedido?.metodoPago === 'efectivo' && 'Efectivo al recibir'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {pedido?.metodoPago === 'webpay' && 'Procesado con WebPay Plus'}
                      {pedido?.metodoPago === 'transferencia' && 'Procesado mediante transferencia bancaria'}
                      {pedido?.metodoPago === 'efectivo' && 'Se pagará al momento de la entrega'}
                    </p>
                  </div>
                </div>
                
                {/* Datos para transferencia bancaria */}
                {pedido?.metodoPago === 'transferencia' && (pedido.estadoPago === 'pendiente') && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4 text-sm">
                    <h4 className="font-semibold text-blue-800 mb-2">Datos bancarios:</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li><span className="font-medium">Banco:</span> Banco Estado</li>
                      <li><span className="font-medium">Tipo de cuenta:</span> Cuenta Corriente</li>
                      <li><span className="font-medium">Número:</span> 123456789</li>
                      <li><span className="font-medium">Nombre:</span> PetShop SpA</li>
                      <li><span className="font-medium">RUT:</span> 76.123.456-7</li>
                      <li><span className="font-medium">Email:</span> pagos@petshop.cl</li>
                      <li><span className="font-medium">Monto:</span> {formatPrice(pedido.total)}</li>
                    </ul>
                    
                    <div className="mt-3 bg-white rounded p-3">
                      <p className="text-blue-800 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Importante
                      </p>
                      <p className="text-blue-700 text-xs mt-1">
                        Enviar comprobante de transferencia a pagos@petshop.cl o mediante el formulario a continuación. Incluye tu número de pedido.
                      </p>
                    </div>
                    
                    {!pedido.comprobantePago && !comprobanteSubido && (
                      <div className="mt-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={comprobante}
                            onChange={handleComprobanteChange}
                            placeholder="Número de comprobante o URL"
                            className="flex-grow px-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={handleSubirComprobante}
                            disabled={subiendoComprobante}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                          >
                            {subiendoComprobante ? 'Enviando...' : 'Enviar'}
                          </button>
                        </div>
                        {errorComprobante && <p className="text-red-600 text-xs mt-1">{errorComprobante}</p>}
                      </div>
                    )}
                    
                    {comprobanteSubido && (
                      <div className="mt-3 p-2 bg-green-100 rounded flex items-center gap-2 text-green-800">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">Comprobante enviado correctamente</span>
                      </div>
                    )}
                    
                    {pedido.comprobantePago && (
                      <div className="mt-3 p-2 bg-green-100 rounded flex items-start gap-2 text-green-800">
                        <svg className="w-5 h-5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <span className="text-sm font-medium">Comprobante recibido</span>
                          <p className="text-xs mt-1">{pedido.comprobantePago}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Información de contacto */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  ¿Necesitas ayuda?
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Si tienes alguna duda sobre tu pedido, puedes contactarnos a través de cualquiera de estos canales:
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Correo electrónico</p>
                      <a href="mailto:ayuda@petshop.cl" className="text-blue-600 hover:underline">ayuda@petshop.cl</a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Chat en vivo</p>
                      <button className="text-blue-600 hover:underline">Iniciar chat</button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Teléfono</p>
                      <a href="tel:+56912345678" className="text-blue-600 hover:underline">+56 9 1234 5678</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
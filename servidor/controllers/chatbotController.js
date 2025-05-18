import ChatMessage from '../models/chatbot.js';
import { v4 as uuidv4 } from 'uuid';

// Función para generar respuestas basadas en patrones
const generateResponse = (message) => {
  // Convertir mensaje a minúsculas para facilitar la comparación
  const lowerMessage = message.toLowerCase();
  
  // Respuestas predefinidas basadas en patrones
  const responses = [
    // Saludos
    { 
      patterns: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'saludos', 'hi'], 
      response: '¡Hola! 👋 Soy el asistente virtual de la tienda de mascotas. ¿En qué puedo ayudarte hoy?' 
    },
    // Despedidas
    { 
      patterns: ['adiós', 'chao', 'hasta luego', 'nos vemos'], 
      response: '¡Gracias por contactarnos! Si necesitas algo más, no dudes en escribirnos nuevamente. ¡Que tengas un excelente día!' 
    },
    // Información sobre productos
    { 
      patterns: ['producto', 'productos', 'artículo', 'artículos', 'catálogo'], 
      response: 'Tenemos una amplia variedad de productos para mascotas, incluyendo alimentos, accesorios, juguetes y productos de higiene. ¿Para qué tipo de mascota estás buscando productos?' 
    },
    // Ofertas
    { 
      patterns: ['oferta', 'descuento', 'promoción', 'rebaja'], 
      response: '¡Tenemos varias ofertas y descuentos disponibles! Te invito a visitar nuestra sección de ofertas en la página principal.'
    },
    // Información sobre perros
    { 
      patterns: ['perro', 'can', 'cachorro', 'canino'], 
      response: 'Tenemos una gran selección de productos para perros, desde alimentos premium hasta juguetes, camas y accesorios. ¿Buscas algo específico?' 
    },
    // Información sobre gatos
    { 
      patterns: ['gato', 'felino', 'minino', 'gatito'], 
      response: 'Disponemos de todo lo necesario para tu gato: alimentos, areneros, juguetes, rascadores y mucho más. ¿En qué puedo ayudarte específicamente?' 
    },
    // Información sobre aves
    { 
      patterns: ['ave', 'pájaro', 'loro', 'canario', 'cotorra'], 
      response: 'Tenemos productos específicos para aves como alimentos especiales, jaulas, juguetes y accesorios. ¿Qué necesitas para tu ave?' 
    },
    // Información sobre peces
    { 
      patterns: ['pez', 'peces', 'acuario', 'pecera'], 
      response: 'Para peces disponemos de alimentos, acuarios, filtros, decoraciones y todo lo necesario para mantener un ambiente acuático saludable. ¿Necesitas algo específico?' 
    },
    // Información sobre envíos
    { 
      patterns: ['envío', 'envio', 'despacho', 'entrega', 'delivery'], 
      response: 'Realizamos envíos a todo el país. El tiempo de entrega varía entre 2 a 5 días hábiles dependiendo de tu ubicación. Los pedidos superiores a $30.000 tienen envío gratuito.' 
    },
    // Información sobre devoluciones
    { 
      patterns: ['devolución', 'devolver', 'cambio', 'reembolso'], 
      response: 'Aceptamos devoluciones dentro de los 14 días posteriores a la compra, siempre que el producto esté en su empaque original y sin usar. Para iniciar una devolución, contacta a nuestro servicio al cliente.' 
    },
    // Contacto
    { 
      patterns: ['contacto', 'teléfono', 'email', 'correo', 'dirección', 'ubicación'], 
      response: 'Puedes contactarnos a través de la sección de contacto en nuestra web, por teléfono al +56 9 1234 5678 o por email a contacto@tiendamascotas.cl. Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00 hrs.' 
    },
    // Alimentos
    { 
      patterns: ['alimento', 'comida', 'pienso', 'croquetas'], 
      response: 'Contamos con alimentos de las mejores marcas para todo tipo de mascotas. Tenemos opciones específicas según edad, tamaño y necesidades especiales. ¿Para qué mascota necesitas alimento?' 
    },
    // Accesorios
    { 
      patterns: ['accesorio', 'collar', 'correa', 'arnés', 'cama'], 
      response: 'Disponemos de una amplia gama de accesorios de calidad para tu mascota: collares, correas, camas, transportadoras y mucho más. ¿Buscas algún accesorio en particular?' 
    },
    // Juguetes
    { 
      patterns: ['juguete', 'jugar', 'entretención', 'diversión'], 
      response: 'Tenemos juguetes para todas las mascotas: pelotas, cuerdas, juguetes interactivos, rascadores para gatos y mucho más. Los juguetes son esenciales para el bienestar mental de tu mascota.' 
    },
    // Consejos de cuidado
    { 
      patterns: ['consejo', 'cuidado', 'tip', 'recomendación', 'salud'], 
      response: 'Es importante proporcionar a tu mascota una alimentación balanceada, ejercicio regular, visitas al veterinario y mucho cariño. ¿Necesitas consejos sobre algo específico?' 
    },
    // Para cualquier otra consulta
    { 
      patterns: [''], // Patrón vacío para capturar cualquier mensaje que no coincida con los anteriores
      response: 'Gracias por tu mensaje. ¿Puedes proporcionar más detalles sobre lo que estás buscando? Estoy aquí para ayudarte con productos, ofertas, envíos o cualquier otra consulta relacionada con mascotas.' 
    }
  ];
  
  // Buscar coincidencias en los patrones
  for (const responseObj of responses) {
    if (responseObj.patterns.some(pattern => pattern && lowerMessage.includes(pattern))) {
      // Si es una función, ejecutarla con los productos como argumento
      if (typeof responseObj.response === 'function') {
        return responseObj.response([]);
      }
      // Si es un string, devolverlo directamente
      return responseObj.response;
    }
  }
  
  // Respuesta predeterminada si no hay coincidencias
  return 'Gracias por tu mensaje. ¿En qué más puedo ayudarte con tu mascota? Puedo informarte sobre nuestros productos, ofertas, envíos o brindarte consejos de cuidado.';
};

// Controlador para enviar mensajes
export const sendMessage = async (req, res) => {
  try {
    const { message, sessionId = uuidv4() } = req.body;
    
    // Guardar mensaje del usuario
    const userMessage = new ChatMessage({
      user: 'user',
      content: message,
      sessionId
    });
    await userMessage.save();
    
    // Generar respuesta basada en patrones (sin consultar productos)
    const botResponse = generateResponse(message);
    
    // Guardar respuesta del bot
    const botMessage = new ChatMessage({
      user: 'bot',
      content: botResponse,
      sessionId
    });
    await botMessage.save();
    
    res.status(200).json({
      success: true,
      data: {
        message: botResponse,
        sessionId
      }
    });
  } catch (error) {
    console.error('Error en chatbot:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al procesar mensaje',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

export const getConversationHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // No requerimos autenticación para obtener el historial
    const messages = await ChatMessage.find({ 
      sessionId 
    }).sort({ timestamp: 1 });
    
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      msg: 'Error al obtener historial de conversación',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Configuración para conectar con un servicio de IA (OpenAI, Hugging Face, etc.)
const AI_API_KEY = process.env.AI_API_KEY;
const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';

export const generateAIResponse = async (message, conversationHistory = []) => {
  try {
    // Preparar contexto para el modelo con información sobre la tienda y el historial de conversación
    const messages = [
      { 
        role: "system", 
        content: `Eres un asistente virtual amigable para la tienda de mascotas. Tu objetivo es proporcionar información útil sobre:
        - Productos para distintos tipos de mascotas (perros, gatos, aves, peces, roedores, reptiles)
        - Categorías principales: alimentos, accesorios, juguetes, higiene y cuidado
        - Proceso de compra, envíos y devoluciones
        - Consejos básicos para el cuidado de mascotas
        - Información de contacto: puedes dirigir a los clientes a la página de contacto
        
        Tienes un tono conversacional, amigable y cercano. Tus respuestas son breves y directas.
        Cuando no sepas algo específico de la tienda, ofrece información general y sugiere contactar con servicio al cliente.
        Evita inventar información específica sobre productos o precios que no conoces.`
      },
      ...conversationHistory.map(msg => ({
        role: msg.user === 'bot' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    // Llamada a la API de IA
    const response = await axios.post(AI_API_URL, {
      model: "gpt-3.5-turbo", // O el modelo que prefieras usar
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error al generar respuesta de IA:', error);
    
    // Respuestas de fallback en caso de error
    const fallbackResponses = [
      "Lo siento, estoy teniendo problemas para procesar tu consulta. ¿Podrías intentarlo de nuevo?",
      "Parece que estoy experimentando algunas dificultades técnicas. ¿Podrías reformular tu pregunta?",
      "En este momento no puedo responder adecuadamente. ¿Te gustaría contactar con nuestro servicio al cliente?",
      "Disculpa la interrupción. Estamos experimentando problemas de conexión. Por favor, intenta más tarde."
    ];
    
    // Seleccionar una respuesta aleatoria de fallback
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
};
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  // Obtener o crear un sessionId al montar el componente
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      fetchChatHistory(storedSessionId);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
      
      // Mensaje de bienvenida
      setMessages([
        { 
          id: 'welcome', 
          content: '¡Hola! 👋 Soy el asistente virtual de la tienda de mascotas. ¿En qué puedo ayudarte hoy?', 
          user: 'bot' 
        }
      ]);
    }
  }, []);

  // Cargar historial de chat - Sin autenticación
  const fetchChatHistory = async (sid) => {
    try {
      // Ya no enviamos token para simplificar
      const response = await axios.get(`/api/chatbot/history/${sid}`);
      
      if (response.data.success && response.data.data.length > 0) {
        setMessages(response.data.data);
      } else {
        // Si no hay historial, mostrar mensaje de bienvenida de todos modos
        setMessages([
          { 
            id: 'welcome', 
            content: '¡Hola! 👋 Soy el asistente virtual de la tienda de mascotas. ¿En qué puedo ayudarte hoy?', 
            user: 'bot' 
          }
        ]);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
      // En caso de error, mostrar mensaje de bienvenida
      setMessages([
        { 
          id: 'welcome', 
          content: '¡Hola! 👋 Soy el asistente virtual de la tienda de mascotas. ¿En qué puedo ayudarte hoy?', 
          user: 'bot' 
        }
      ]);
    }
  };

  // Scroll al último mensaje
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Añadir mensaje del usuario a la UI inmediatamente
    const userMessage = {
      id: `msg_${Date.now()}`,
      content: newMessage,
      user: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      // Enviar mensaje al backend
      const response = await axios.post('/api/chatbot/message', {
        message: newMessage,
        sessionId: sessionId
      });
      
      if (response.data.success) {
        // Añadir respuesta del bot
        setMessages(prev => [...prev, {
          id: `bot_${Date.now()}`,
          content: response.data.data.message,
          user: 'bot',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      // Mensaje de error
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        content: "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde.",
        user: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Sugerencias rápidas para el usuario
  const quickSuggestions = [
    "¿Qué alimento es mejor para mi perro?",
    "¿Tienen ofertas para gatos?",
    "¿Cómo puedo rastrear mi pedido?",
    "Quiero hacer una devolución"
  ];

  const handleSuggestionClick = (suggestion) => {
    setNewMessage(suggestion);
  };

  return (
    <>
      {/* Botón del chatbot */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-[#FFD15C] text-white shadow-lg flex items-center justify-center hover:bg-[#FFA51C] transition-all duration-300"
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </motion.button>
      
      {/* Ventana del chatbot */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            {/* Header del chat */}
            <div className="bg-gradient-to-r from-[#FFD15C] to-[#FFA51C] px-4 py-3 flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white">Asistente de Mascotas</h3>
                <p className="text-white/80 text-xs">Responderé todas tus dudas</p>
              </div>
            </div>
            
            {/* Cuerpo del chat - Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ minHeight: '300px' }}>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id || msg._id || index}
                  className={`flex mb-3 ${msg.user === 'bot' ? 'justify-start' : 'justify-end'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.user === 'bot' 
                        ? 'bg-white text-gray-800 rounded-tl-none shadow-sm' 
                        : 'bg-[#FFD15C] text-white rounded-tr-none shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              
              {/* Indicador de "escribiendo..." */}
              {isLoading && (
                <motion.div 
                  className="flex mb-3 justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-white text-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center">
                    <div className="flex space-x-1">
                      <motion.div 
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                      />
                      <motion.div 
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.1 }}
                      />
                      <motion.div 
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Sugerencias rápidas */}
            {messages.length < 3 && (
              <motion.div 
                className="p-2 bg-gray-50 border-t border-gray-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs text-gray-500 mb-2 px-2">Preguntas frecuentes:</p>
                <div className="flex flex-wrap gap-2 px-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-50 hover:border-[#FFD15C] transition-colors text-gray-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Input para enviar mensajes */}
            <form 
              onSubmit={handleSendMessage} 
              className="bg-white p-3 border-t border-gray-200 flex items-center"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-[#FFD15C] text-sm"
                disabled={isLoading}
              />
              <motion.button
                type="submit"
                className="ml-2 w-10 h-10 rounded-full bg-[#FFD15C] flex items-center justify-center text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={isLoading || !newMessage.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
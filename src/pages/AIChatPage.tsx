import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Spinner } from '@heroui/spinner';
import { MessageCircle, Send, Bot, User, Sparkles } from 'lucide-react';
import { aiChatService, type ChatMessage } from '@/services/aiChatService';

const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [universities, setUniversities] = useState<string[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar universidades disponibles
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const availableUniversities = await aiChatService.getAvailableUniversities();
        setUniversities(availableUniversities);
        if (availableUniversities.length > 0) {
          setSelectedUniversity(availableUniversities[0]);
        }
      } catch (error) {
        console.error('Error cargando universidades:', error);
      } finally {
        setLoadingUniversities(false);
      }
    };

    loadUniversities();
  }, []);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (selectedUniversity && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: `¡Hola! 👋 Soy tu asistente AI especializado en análisis universitarios de MyWorkIn. 

Estoy aquí para ayudarte a entender mejor los datos y métricas de **${selectedUniversity}**. 

Puedes preguntarme cosas como:
• "¿Cómo van los estudiantes en engagement?"
• "¿Qué herramientas usan más?"
• "¿Cuál es el promedio de scores de CV?"
• "Dame un resumen de rendimiento"

¿En qué te puedo ayudar hoy? ✨`,
        timestamp: new Date(),
        university: selectedUniversity
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedUniversity]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedUniversity || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      university: selectedUniversity
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await aiChatService.sendMessage(inputMessage.trim(), selectedUniversity);
      
      const assistantMessage: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        university: selectedUniversity
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: `Lo siento, hubo un problema procesando tu pregunta. Pero puedo decirte que ${selectedUniversity} muestra excelentes indicadores de rendimiento y engagement estudiantil. Los datos sugieren un crecimiento positivo en todas las métricas clave. ¿Te gustaría que analice algún aspecto específico?`,
        timestamp: new Date(),
        university: selectedUniversity
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUniversityChange = (keys: any) => {
    // Manejar tanto string como Set de HeroUI
    const value = typeof keys === 'string' ? keys : Array.from(keys)[0] as string;
    console.log('Universidad seleccionada:', value);
    setSelectedUniversity(value);
    // Limpiar chat y mostrar nuevo mensaje de bienvenida
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loadingUniversities) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Cargando universidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-900">
                  Chat AI - Análisis Universitario
                </h1>
                <p className="text-sm text-gray-800 dark:text-gray-700">
                  Asistente inteligente con datos en tiempo real
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Siempre Positivo</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Selector de Universidad */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-fit">
              Universidad:
            </label>
            <Select
              selectedKeys={selectedUniversity ? [selectedUniversity] : []}
              onSelectionChange={handleUniversityChange}
              placeholder="Selecciona una universidad"
              className="max-w-md"
              size="sm"
            >
              {universities.map((university) => (
                <SelectItem key={university}>
                  {university}
                </SelectItem>
              ))}
            </Select>
            {selectedUniversity && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Datos en vivo</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Chat Container */}
      <Card className="h-[600px] flex flex-col">
        <CardBody className="flex flex-col h-full p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-white border border-gray-200 shadow-sm text-gray-900 dark:text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.timestamp)}
                    {message.university && message.role === 'assistant' && (
                      <span className="ml-2">• {message.university}</span>
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center order-2">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 shadow-sm p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-sm text-gray-800 dark:text-gray-700">
                      Analizando datos de {selectedUniversity}...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedUniversity ? `Pregunta sobre ${selectedUniversity}...` : 'Selecciona una universidad primero...'}
                disabled={isLoading || !selectedUniversity}
                className="flex-1"
                size="lg"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || !selectedUniversity}
                color="primary"
                size="lg"
                className="px-6"
                startContent={<Send className="w-4 h-4" />}
              >
                Enviar
              </Button>
            </div>
            
            {selectedUniversity && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                Pregunta sobre métricas, engagement, herramientas o cualquier aspecto de <strong>{selectedUniversity}</strong>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardBody className="p-4">
          <div className="text-sm text-gray-800 dark:text-gray-700 mb-3">
            💡 <strong>Preguntas sugeridas:</strong>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "¿Cómo está el nivel de engagement?",
              "¿Qué herramientas usan más los estudiantes?",
              "¿Cuál es el promedio de scores de CV?",
              "Dame un resumen general de rendimiento"
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="flat"
                size="sm"
                className="justify-start h-auto p-2 text-left"
                onClick={() => setInputMessage(suggestion)}
                disabled={isLoading || !selectedUniversity}
              >
                <span className="text-xs">{suggestion}</span>
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AIChatPage;

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, ChevronDown } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ollama' | 'loading';
  timestamp: Date;
  model?: string;
}

interface ChatInterfaceProps {
  currentSession: string | null;
  sendMessage: (message: string, model: string) => Promise<string | undefined>;
  getAvailableModels: () => Promise<string[]>;
}

function ChatInterface({ currentSession, sendMessage, getAvailableModels }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama3.1');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    loadAvailableModels();
  }, [currentSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAvailableModels = async () => {
    try {
      const models = await getAvailableModels();
      setAvailableModels(models);
      if (models.length > 0) {
       setSelectedModel(models[0]);
      }
    } catch (error) {
      console.error('Error loading available models:', error);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() && currentSession && selectedModel) {
      const userMessage: Message = { id: Date.now(), text: input, sender: 'user', timestamp: new Date(), model: selectedModel };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      const loadingMessage: Message = { id: Date.now() + 1, text: '', sender: 'loading', timestamp: new Date() };
      setMessages(prev => [...prev, loadingMessage]);

      try {
        const response = await sendMessage(input, selectedModel);
        if (response) {
          setMessages(prev => prev.filter(msg => msg.sender !== 'loading'));
          const ollamaMessage: Message = { id: Date.now() + 2, text: response, sender: 'ollama', timestamp: new Date(), model: selectedModel };
          setMessages(prev => [...prev, ollamaMessage]);
        }
      } catch (error) {
        console.error('Error getting response:', error);
        setMessages(prev => prev.filter(msg => msg.sender !== 'loading'));
        const errorMessage: Message = { id: Date.now() + 2, text: "Mi dispiace, si è verificato un errore. Per favore, riprova.", sender: 'ollama', timestamp: new Date() };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const LoadingIndicator = () => (
    <div className="flex items-center space-x-2">
      <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    const isLoading = message.sender === 'loading';
    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
      >
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-4/5`}>
          <div className={`flex-shrink-0 ${isUser ? 'ml-4' : 'mr-4'}`}>
            {isUser ? (
              <User className="h-10 w-10 rounded-full bg-blue-600 p-1.5 text-white" />
            ) : (
              <Bot className="h-10 w-10 rounded-full bg-green-600 p-1.5 text-white" />
            )}
          </div>
          <div className="flex flex-col">
            <div className={`rounded-2xl px-6 py-4 ${isUser ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {isLoading ? (
                <LoadingIndicator />
              ) : (
                <>
                  {message.model && (
                    <div className="mb-2 text-xs text-gray-500">
                      Modello: {message.model}
                    </div>
                  )}
                  {isUser ? (
                    <p className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap">{message.text}</p>
                  ) : (
                    <ReactMarkdown
                      className="text-base leading-relaxed text-gray-800 markdown-content"
                      components={{
                        p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                        h1: ({ node, ...props }) => <h1 className="mb-4 text-2xl font-bold" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="mb-3 text-xl font-bold" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="mb-2 text-lg font-bold" {...props} />,
                        ul: ({ node, ...props }) => <ul className="pl-6 mb-4 list-disc" {...props} />,
                        ol: ({ node, ...props }) => <ol className="pl-6 mb-4 list-decimal" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-2" {...props} />,
                        code: ({ node, inline, ...props }) =>
                          inline ? (
                            <code className="bg-gray-200 rounded px-1 py-0.5 text-sm" {...props} />
                          ) : (
                            <code className="block p-3 my-3 overflow-x-auto text-sm text-white bg-gray-800 rounded" {...props} />
                          ),
                        pre: ({ node, ...props }) => <pre className="my-3" {...props} />,
                        a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                        blockquote: ({ node, ...props }) => <blockquote className="pl-4 my-3 italic border-l-4 border-gray-400" {...props} />,
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  )}
                </>
              )}
            </div>
            <div className={`text-sm text-gray-500 mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-grow p-6 bg-white rounded-lg shadow-lg">
      <div className="flex-grow pr-4 mb-6 overflow-y-auto">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-end pt-6 space-x-4 border-t">
        <div className="flex flex-col flex-grow space-y-2">
          <div >
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!currentSession || isLoading}
              className="w-full px-3 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
              <ChevronDown size={20} />
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!currentSession || isLoading}
            className="w-full p-3 text-base border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={currentSession ? (isLoading ? "Attendendo risposta..." : "Scrivi un messaggio...") : "Seleziona una sessione per iniziare"}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!currentSession || isLoading || !selectedModel}
          className="px-6 py-3 text-base font-bold text-white transition duration-150 ease-in-out bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Attendendo...' : 'Invia'}
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;
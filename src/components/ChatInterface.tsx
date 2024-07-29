import  { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, ChevronDown } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ollama' | 'loading';
  timestamp: string;
  model: string;
}

interface Session {
  id: string;
  name: string;
  messages: Message[];
}

interface ChatInterfaceProps {
  currentSession: Session | null;
  sendMessage: (message: string, model: string) => Promise<string | undefined>;
  getAvailableModels: () => Promise<string[]>;
}

function ChatInterface({ currentSession, sendMessage, getAvailableModels }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel] = useState<string>('llama3.1');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentSession) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [currentSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (currentSession) {
      const loadedMessages = await window.api.getMessages(currentSession.id);
      setMessages(loadedMessages);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() && currentSession && selectedModel) {
      setIsLoading(true);
      const response = await sendMessage(input, selectedModel);
      setInput('');
      await loadMessages(); // Ricarica i messaggi dopo l'invio
      setIsLoading(false);
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
                      {new Date(message.timestamp).toLocaleString()}
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
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-grow p-4 bg-white rounded-lg shadow-lg">
      <div className="flex-grow mb-4 space-y-4 overflow-y-auto">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center space-x-2">
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={currentSession ? "Scrivi un messaggio..." : "Seleziona una sessione per iniziare"}
          className="flex-grow p-2 border border-gray-300 rounded"
          disabled={!currentSession || isLoading}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!currentSession || isLoading || !input.trim()}
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Invio...' : 'Invia'}
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;
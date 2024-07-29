import React, { useState, useEffect } from 'react';
import SessionManager from './SessionManager';
import ChatInterface from './ChatInterface';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ollama';
  timestamp: string;
  model: string;
}

interface Session {
  id: string;
  name: string;
  messages: Message[];
}

function OllamaInterface() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const loadedSessions = await window.api.getSessions();
    setSessions(loadedSessions);
  };

  const handleCreateSession = async (sessionName: string) => {
    const newSession = await window.api.createSession(sessionName);
    setSessions([...sessions, newSession]);
    setCurrentSession(newSession);
  };

  const handleDeleteSession = async (sessionId: string) => {
    await window.api.deleteSession(sessionId);
    setSessions(sessions.filter(s => s.id !== sessionId));
    if (currentSession && currentSession.id === sessionId) {
      setCurrentSession(null);
    }
  };

  const handleSendMessage = async (message: string, model: string) => {
    if (currentSession) {
      const newMessage: Message = {
        id: Date.now(),
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
        model: model
      };
      await window.api.addMessage(currentSession.id, newMessage);
      const response = await window.api.generate(currentSession.id, model, message);
      if (response) {
        const ollamaMessage: Message = {
          id: Date.now() + 1,
          text: response,
          sender: 'ollama',
          timestamp: new Date().toISOString(),
          model: model
        };
        await window.api.addMessage(currentSession.id, ollamaMessage);
      }
      return response;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <SessionManager
        sessions={sessions}
        currentSession={currentSession}
        setCurrentSession={setCurrentSession}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
      />
      <ChatInterface
        currentSession={currentSession}
        sendMessage={handleSendMessage}
        getAvailableModels={window.api.getAvailableModels}
      />
    </div>
  );
}

export default OllamaInterface;
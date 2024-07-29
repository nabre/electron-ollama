import React, { useState, useEffect } from 'react';
import SessionManager from './SessionManager';
import ChatInterface from './ChatInterface';
import OllamaCheck from './OllamaCheck';
import { Session, Message, OllamaStatus } from './types';

function OllamaInterface() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>({ status: 'inactive' });

  useEffect(() => {
    loadSessions();
    window.api.checkOllamaStatus();

    const handleOllamaStatus = (status: OllamaStatus) => {
      setOllamaStatus(status);
    };

    window.api.onOllamaStatus(handleOllamaStatus);

    return () => {
      window.api.removeOllamaStatusListener();
    };
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

  const handleInstallOllama = () => {
    window.api.installOllama();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="p-4 bg-white shadow-md">
        <OllamaCheck
          status={ollamaStatus.status}
          version={ollamaStatus.version}
          onInstall={handleInstallOllama}
        />
      </div>
      <div className='flex overflow-auto grow'>
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

    </div>
  );
}

export default OllamaInterface;
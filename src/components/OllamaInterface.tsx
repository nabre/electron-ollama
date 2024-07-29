import React, { useState, useEffect } from 'react';
import OllamaCheck from './OllamaCheck';
import SessionManager from './SessionManager';
import ChatInterface from './ChatInterface';
import { OllamaStatus } from '../types';

function OllamaInterface() {
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>({ status: 'inactive' });
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [sessions, setSessions] = useState<string[]>([]);

  useEffect(() => {
    window.api.checkOllamaStatus();
    loadSessions();

    window.api.onOllamaStatus((event, status) => {
      setOllamaStatus(status);
    });

    return () => {
      // Implementare la rimozione del listener se necessario
    };
  }, []);

  const loadSessions = async () => {
    const loadedSessions = await window.api.getSessions();
    setSessions(loadedSessions);
  };

  const handleCreateSession = async (sessionName: string) => {
    await window.api.createSession(sessionName);
    setCurrentSession(sessionName);
    loadSessions();
  };

  const handleSendMessage = async (message: string, model: string) => {
    if (currentSession) {
      const response = await window.api.generate(currentSession, model, message);
      return response;
    }
  };

  const getAvailableModels = async () => {
    return await window.api.getAvailableModels();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="p-4 bg-white shadow-md">
        <OllamaCheck
          status={ollamaStatus.status}
          version={ollamaStatus.version}
          onInstall={() => window.api.installOllama()}
        />
      </div>
      <div className="flex flex-col flex-grow">
        <SessionManager
          sessions={sessions}
          currentSession={currentSession}
          setCurrentSession={setCurrentSession}
          onCreateSession={handleCreateSession}
        />
        <ChatInterface
          currentSession={currentSession}
          sendMessage={handleSendMessage}
          getAvailableModels={getAvailableModels}
        />
      </div>
    </div>
  );
}

export default OllamaInterface;
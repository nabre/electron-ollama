import React, { useState, useEffect, useCallback } from 'react';
import SessionManager from './SessionManager';
import ChatInterface from './ChatInterface';
import { Session } from '../types';

const showErrorNotification = (message: string, ...props: any[]) => {
  // Implementa questa funzione utilizzando il sistema di notifiche della tua scelta
  // Ad esempio, potresti usare react-toastify o un componente personalizzato
  console.error(message, ...props); // Placeholder, sostituisci con una vera implementazione
};

const isValidSessionName = (name: string, existingSessions: Session[]): boolean => {
  if (name.trim().length === 0) return false;
  if (existingSessions.some(session => session.name.toLowerCase() === name.toLowerCase())) return false;
  return true;
};

function OllamaInterface() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  useEffect(() => {
    // Carica le sessioni iniziali
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const loadedSessions = await window.api.getSessions();
    setSessions(loadedSessions);
  };

  const handleCreateSession = async (name: string) => {
    if (!isValidSessionName(name, sessions)) {
      showErrorNotification('Nome sessione non valido o già esistente.');
      return;
    }
    const newSession = await window.api.createSession(name);
    setSessions([...sessions, newSession]);
    setCurrentSession(newSession);
  };


  const handleRenameSession = async (id: string, newName: string) => {
    if (!isValidSessionName(newName, sessions.filter(s => s.id !== id))) {
      showErrorNotification('Nome sessione non valido o già esistente.');
      return;
    }

    try {
      const updatedSession = await window.api.renameSession(id, newName);
      setSessions(sessions.map(s => s.id === id ? updatedSession : s));
      if (currentSession && currentSession.id === id) {
        setCurrentSession(updatedSession);
      }
    } catch (error) {
      showErrorNotification('Impossibile rinominare la sessione:', error);
    }
  };

  const handleDeleteSession = async (id: string) => {
    setSessions(await window.api.deleteSession(id));
    if (currentSession && currentSession.id === id) {
      setCurrentSession(null);
    }
  };

  const handleSendMessage = useCallback(async (sessionId: string, message: string, model: string) => {

    if (!sessionId) {
      console.error('SessionId is undefined');
      return;
    }
    try {
      const response = await window.api.sendMessage(sessionId, message, model);
      await loadSessions(); // Ricarica le sessioni per ottenere i messaggi aggiornati
      return response;
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
      // Gestisci l'errore, ad esempio mostrando un messaggio all'utente
    }
  }, []);


  return (
    <div className='flex h-screen'>
      <SessionManager
        sessions={sessions}
        currentSession={currentSession}
        setCurrentSession={setCurrentSession}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
      />
      <ChatInterface currentSession={currentSession} sendMessage={handleSendMessage} />
    </div>
  );
}

export default OllamaInterface;
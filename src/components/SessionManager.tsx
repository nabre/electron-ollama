import React, { useState } from 'react';

interface SessionManagerProps {
  sessions: string[];
  currentSession: string | null;
  setCurrentSession: (session: string) => void;
  onCreateSession: (sessionName: string) => void;
}

function SessionManager({ sessions, currentSession, setCurrentSession, onCreateSession }: SessionManagerProps) {
  const [newSessionName, setNewSessionName] = useState('');

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      onCreateSession(newSessionName);
      setNewSessionName('');
    }
  };

  return (
    <div className="p-4 bg-white shadow-md">
      <div className="flex items-center space-x-4">
        <select
          value={currentSession || ''}
          onChange={(e) => setCurrentSession(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded"
        >
          <option value="">Seleziona una sessione</option>
          {sessions.map(session => (
            <option key={session} value={session}>{session}</option>
          ))}
        </select>
        <input
          type="text"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
          placeholder="Nome nuova sessione"
          className="flex-grow p-2 border border-gray-300 rounded"
        />
        <button 
          onClick={handleCreateSession}
          className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-600"
        >
          Crea Sessione
        </button>
      </div>
    </div>
  );
}

export default SessionManager;
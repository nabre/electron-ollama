import React, { useState } from 'react';

interface Session {
  id: string;
  name: string;
}

interface SessionManagerProps {
  sessions: Session[];
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;
  onCreateSession: (name: string) => void;
  onDeleteSession: (id: string) => void;
}

function SessionManager({ sessions, currentSession, setCurrentSession, onCreateSession, onDeleteSession }: SessionManagerProps) {
  const [newSessionName, setNewSessionName] = useState('');

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      onCreateSession(newSessionName);
      setNewSessionName('');
    }
  };

  return (
    <div className="p-4 bg-white shadow-md">
      <div className="flex items-center mb-4 space-x-4">
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
      <div className="flex flex-wrap gap-2">
        {sessions.map(session => (
          <div 
            key={session.id} 
            className={`p-2 rounded cursor-pointer ${
              currentSession?.id === session.id ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setCurrentSession(session)}
          >
            {session.name}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SessionManager;
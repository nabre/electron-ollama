import { Button, TextInput } from 'flowbite-react';
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
    <div className="flex flex-col gap-4 p-2 bg-white shadow-md verflow-auto ">
      <div className='flex gap-2'>
        <div>
          <input
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            placeholder="Nome nuova sessione"
            className='max-w-full '
          />
        </div>
        <Button onClick={handleCreateSession} >
          Crea Sessione
        </Button>
      </div>


      <div className="flex flex-col flex-wrap gap-2 overflow-auto">
        {sessions.map(session => (
          <div
            key={session.id}
            className={`p-2 rounded cursor-pointer ${currentSession?.id === session.id ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
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
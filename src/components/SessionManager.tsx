import  {  useState } from 'react';
import { Button, TextInput } from 'flowbite-react';
import { HiPlus, HiX, HiCheck, HiPencil } from 'react-icons/hi';
import { Session } from '../types';

interface SessionManagerProps {
  sessions: Session[];
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;
  onCreateSession: (name: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newName: string) => void;
}

function SessionManager({
  sessions,
  currentSession,
  setCurrentSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession
}: SessionManagerProps) {
  const [newSessionName, setNewSessionName] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  
  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      onCreateSession(newSessionName);
      setNewSessionName('');
    }
  };

  const startEditing = (session: Session) => {
    setEditingSessionId(session.id);
    setEditingName(session.name);
  };

  const saveEdit = () => {
    if (editingSessionId && editingName.trim()) {
      onRenameSession(editingSessionId, editingName);
      setEditingSessionId(null);
    }
  };

  const cancelEdit = () => {
    setEditingSessionId(null);
    setEditingName('');
  };

  return (
    <div className="p-6 overflow-auto bg-white rounded-lg shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Gestione Sessioni</h2>

      {/* Input per nuova sessione */}
      <div className="mb-6">
        <div className="flex rounded-md shadow-sm">
          <input
            type="text"
            placeholder="Nome nuova sessione"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            className="block w-full px-4 py-3 text-sm border-gray-200 rounded-l-md focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateSession();
              }
            }}
          />
          <button
            type="button"
            onClick={handleCreateSession}
            disabled={!newSessionName.trim()}
            className="inline-flex items-center justify-center flex-shrink-0 gap-2 px-4 py-3 text-sm font-semibold text-white transition-all bg-blue-500 border border-transparent rounded-r-md hover:bg-blue-600 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
          >
            <HiPlus className="w-4 h-4" />
            Aggiungi
          </button>
        </div>
      </div>

      {/* Lista Sessioni Attive */}
      <div>
        <h3 className="mb-4 text-xl font-semibold text-gray-700">Sessioni Attive</h3>
        <div className="space-y-3 overflow-auto">
          {sessions.length > 0 ? (
            sessions.map(session => (
              <div
                key={session.id}
                className={`flex flex-col p-3 rounded-lg transition-all duration-200 ${editingSessionId === session.id
                  ? 'bg-yellow-50 border-2 border-yellow-400'
                  : currentSession?.id === session.id
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                  }`}
              >
                {editingSessionId === session.id ? (
                  // Modalità di editing
                  <>
                    <div className="flex mb-2">
                      <TextInput
                        sizing={"sm"}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Nuovo nome sessione"
                        autoFocus
                      />
                    </div>
                    <p className="mt-1 text-xs text-yellow-600">Modifica in corso...</p>
                    <div className="flex justify-end space-x-2">
                      <Button size="xs" color="success" onClick={saveEdit} className="bg-green-500 hover:bg-green-600">
                        <HiCheck className="w-4 h-4 mr-1" />
                        Salva
                      </Button>
                      <Button size="xs" color="light" onClick={cancelEdit} className="bg-gray-200 hover:bg-gray-300">
                        <HiX className="w-4 h-4 mr-1" />
                        Annulla
                      </Button>
                    </div>
                  </>
                ) : (
                  // Modalità di visualizzazione
                  <>
                    <div className="flex items-center justify-between w-full gap-1 mb-2">
                      <div className="flex items-center space-x-2 grow">
                        {currentSession?.id === session.id && (
                          <HiCheck className="w-5 h-5 text-blue-500" />
                        )}
                        <span className="font-medium text-gray-800 grow">{session.name}</span>
                        {currentSession?.id !== session.id && (
                          <Button
                            size="xs"
                            color="info"
                            onClick={() => setCurrentSession(session)}
                          >
                            Seleziona
                          </Button>
                        )}
                      </div>
                      <Button.Group>
                        <Button
                          size="xs"
                          color="light"
                          onClick={() => startEditing(session)}
                        >
                          <HiPencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="xs"
                          color="failure"
                          onClick={() => onDeleteSession(session.id)}
                        >
                          <HiX className="w-4 h-4 " />
                        </Button>
                      </Button.Group>
                    </div>

                  </>
                )}
              </div>
            ))
          ) : (
            <p className="py-4 italic text-center text-gray-500">Nessuna sessione attiva</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SessionManager;
import React from 'react';

interface OllamaCheckProps {
  status: 'active' | 'inactive' | 'not-installed';
  version?: string;
  onInstall: () => void;
}

function OllamaCheck({ status, version, onInstall }: OllamaCheckProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-lg font-semibold">
          Stato Ollama: 
          <span className={`ml-2 ${
            status === 'active' ? 'text-green-600' :
            status === 'inactive' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {status}
          </span>
        </p>
        {status === 'active' && version && (
          <p className="text-sm text-gray-600">Versione: {version}</p>
        )}
      </div>
      {status === 'not-installed' && (
        <button 
          onClick={onInstall}
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Installa Ollama
        </button>
      )}
    </div>
  );
}

export default OllamaCheck;

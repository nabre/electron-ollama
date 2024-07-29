export interface OllamaStatus {
    status: 'active' | 'inactive' | 'not-installed';
    version?: string;
  }
  
  export interface ApiInterface {
    createSession: (sessionName: string) => Promise<string>;
    generate: (sessionName: string, model: string, prompt: string) => Promise<string>;
    getSessions: () => Promise<string[]>;
    checkOllamaStatus: () => Promise<void>;
    onOllamaStatus: (callback: (event: Electron.IpcRendererEvent, status: OllamaStatus) => void) => void;
    installOllama: () => Promise<void>;
  }
  
  declare global {
    interface Window {
      api: ApiInterface;
    }
  }
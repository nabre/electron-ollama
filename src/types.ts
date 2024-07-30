export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ollama' |'loading';
  timestamp: string;
  model: string;
}

export interface Session {
  id: string;
  name: string;
  timestamp: string;
  messages: Message[];
}

export interface OllamaStatus {
  status: 'active' | 'inactive' | 'not-installed';
  version?: string;
}
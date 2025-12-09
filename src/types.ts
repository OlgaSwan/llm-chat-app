export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  timestamp: number;
}

export interface Thread {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

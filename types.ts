
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64 for binary, raw text for text/plain
  size?: number;
  originalFileType?: string; // e.g. 'docx', 'pdf'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  attachments?: Attachment[];
  timestamp: number;
  isStreaming?: boolean;
  isError?: boolean;
  errorMessage?: string;
  groundingMetadata?: any; // For Google Search Grounding results
  plan?: string; // Extracted plan content
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  theme?: 'blue' | 'yellow' | 'green' | 'purple' | 'default'; 
}

export interface ApiKeys {
  deepseek?: string;
  kimi?: string;
  qwen?: string;
}

export interface UserProfile {
  nickname: string;
  profession: string;
  about: string;
  customInstructions: string;
}

export type AppView = 'chat' | 'notes';
export type Language = 'en' | 'zh';

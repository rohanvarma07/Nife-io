export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface Thread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  messages: Message[];
}

export interface ChatStore {
  threads: Thread[];
  activeThreadId: string | null;
  sidebarCollapsed: boolean;
  isStreaming: boolean;
  searchQuery: string;
  
  // Thread actions
  createThread: () => string;
  deleteThread: (threadId: string) => void;
  renameThread: (threadId: string, title: string) => void;
  setActiveThread: (threadId: string) => void;
  
  // Message actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  
  // UI state
  setSidebarCollapsed: (collapsed: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  setSearchQuery: (query: string) => void;
  
  // Persistence
  exportThread: (threadId: string) => string;
  importThread: (jsonData: string) => void;
  
  // Utilities
  getActiveThread: () => Thread | null;
  getFilteredThreads: () => Thread[];
}

export interface StreamingConfig {
  delay: number;
  chunkSize: number;
}

export type MockResponseType = 'echo' | 'reverse' | 'llm-style';

export interface MockResponder {
  respond: (message: string, type?: MockResponseType) => AsyncIterableIterator<string>;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createDefaultThread = () => ({
  id: generateId(),
  title: 'New Chat',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  model: 'gpt-4-turbo',
  messages: [],
});

export const useChatStore = create(
  persist(
    (set, get) => ({
      threads: [],
      activeThreadId: null,
      sidebarCollapsed: false,
      isStreaming: false,
      searchQuery: '',

      createThread: () => {
        const newThread = createDefaultThread();
        set((state) => ({
          threads: [newThread, ...state.threads],
          activeThreadId: newThread.id,
        }));
        return newThread.id;
      },

      deleteThread: (threadId) => {
        set((state) => {
          const newThreads = state.threads.filter(t => t.id !== threadId);
          const newActiveId = state.activeThreadId === threadId 
            ? (newThreads.length > 0 ? newThreads[0].id : null)
            : state.activeThreadId;
          
          return {
            threads: newThreads,
            activeThreadId: newActiveId,
          };
        });
      },

      renameThread: (threadId, title) => {
        set((state) => ({
          threads: state.threads.map(thread =>
            thread.id === threadId
              ? { ...thread, title, updatedAt: Date.now() }
              : thread
          ),
        }));
      },

      setActiveThread: (threadId) => {
        set({ activeThreadId: threadId });
      },

      addMessage: (message) => {
        const newMessage = {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        };

        set((state) => {
          const activeThread = state.threads.find(t => t.id === state.activeThreadId);
          if (!activeThread) return state;

          // Auto-generate title from first user message
          const shouldUpdateTitle = activeThread.messages.length === 0 && 
            message.role === 'user' && 
            activeThread.title === 'New Chat';

          const updatedThread = {
            ...activeThread,
            messages: [...activeThread.messages, newMessage],
            updatedAt: Date.now(),
            title: shouldUpdateTitle 
              ? message.content.slice(0, 60) + (message.content.length > 60 ? '...' : '')
              : activeThread.title,
          };

          return {
            threads: state.threads.map(thread =>
              thread.id === state.activeThreadId ? updatedThread : thread
            ),
          };
        });
      },

      updateMessage: (messageId, updates) => {
        set((state) => {
          const activeThread = state.threads.find(t => t.id === state.activeThreadId);
          if (!activeThread) return state;

          const updatedThread = {
            ...activeThread,
            messages: activeThread.messages.map(msg =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
            updatedAt: Date.now(),
          };

          return {
            threads: state.threads.map(thread =>
              thread.id === state.activeThreadId ? updatedThread : thread
            ),
          };
        });
      },

      clearMessages: () => {
        set((state) => {
          const activeThread = state.threads.find(t => t.id === state.activeThreadId);
          if (!activeThread) return state;

          const updatedThread = {
            ...activeThread,
            messages: [],
            updatedAt: Date.now(),
          };

          return {
            threads: state.threads.map(thread =>
              thread.id === state.activeThreadId ? updatedThread : thread
            ),
          };
        });
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },

      setIsStreaming: (streaming) => {
        set({ isStreaming: streaming });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      exportThread: (threadId) => {
        const thread = get().threads.find(t => t.id === threadId);
        if (!thread) throw new Error('Thread not found');
        return JSON.stringify(thread, null, 2);
      },

      importThread: (jsonData) => {
        try {
          const thread = JSON.parse(jsonData);
          // Generate new ID to avoid conflicts
          const importedThread = {
            ...thread,
            id: generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          set((state) => ({
            threads: [importedThread, ...state.threads],
            activeThreadId: importedThread.id,
          }));
        } catch (error) {
          throw new Error('Invalid thread data');
        }
      },

      getActiveThread: () => {
        const state = get();
        return state.threads.find(t => t.id === state.activeThreadId) || null;
      },

      getFilteredThreads: () => {
        const state = get();
        if (!state.searchQuery) return state.threads;
        
        const query = state.searchQuery.toLowerCase();
        return state.threads.filter(thread =>
          thread.title.toLowerCase().includes(query) ||
          thread.messages.some(msg => 
            msg.content.toLowerCase().includes(query)
          )
        );
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        threads: state.threads,
        activeThreadId: state.activeThreadId,
      }),
    }
  )
);

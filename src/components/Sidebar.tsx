import React, { useState } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Download,
  Upload,
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun,
} from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useDarkMode } from '../hooks/useDarkMode';
import type { Thread } from '../types/chat';

interface ThreadItemProps {
  thread: Thread;
  isActive: boolean;
  onSelect: () => void;
}

const ThreadItem: React.FC<ThreadItemProps> = ({ thread, isActive, onSelect }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(thread.title);
  
  const { renameThread, deleteThread, exportThread } = useChatStore();

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== thread.title) {
      renameThread(thread.id, newTitle.trim());
    }
    setIsRenaming(false);
    setShowMenu(false);
  };

  const handleDelete = () => {
    deleteThread(thread.id);
    setShowMenu(false);
  };

  const handleExport = () => {
    try {
      const data = exportThread(thread.id);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${thread.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
    setShowMenu(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`group relative p-2.5 sm:p-3 rounded-lg cursor-pointer transition-colors touch-manipulation ${
        isActive 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setIsRenaming(false);
                  setNewTitle(thread.title);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-xs sm:text-sm font-medium bg-white dark:bg-gray-700 border rounded px-2 py-1"
              autoFocus
            />
          ) : (
            <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {thread.title}
            </h3>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(thread.updatedAt)} · {thread.messages.length} msgs
          </p>
        </div>
        
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 sm:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity touch-manipulation"
          >
            <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
          </button>
          
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-40 sm:w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
                >
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Rename
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 w-full px-3 py-2.5 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Export
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-2.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const {
    activeThreadId,
    sidebarCollapsed,
    searchQuery,
    createThread,
    setActiveThread,
    setSidebarCollapsed,
    setSearchQuery,
    getFilteredThreads,
    importThread,
  } = useChatStore();
  
  const [darkMode, setDarkMode] = useDarkMode();

  const filteredThreads = getFilteredThreads();

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            importThread(content);
          } catch (error) {
            alert('Failed to import thread. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (sidebarCollapsed) {
    return (
      <div className="w-12 bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col items-center py-4">
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
        >
          <PanelLeftOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => createThread()}
          className="mt-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
        >
          <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 sm:w-72 lg:w-80 bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Chats
          </h1>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg touch-manipulation"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <button
              onClick={handleImport}
              className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg touch-manipulation"
              title="Import Chat"
            >
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg touch-manipulation"
            >
              <PanelLeftClose className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        <button
          onClick={() => createThread()}
          className="w-full flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm sm:text-base font-medium">New Chat</span>
        </button>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredThreads.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No matching conversations' : 'No conversations yet'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredThreads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isActive={thread.id === activeThreadId}
                onSelect={() => setActiveThread(thread.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Edit2, Check, X, Trash2, Settings, Menu } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import Message from './Message';

const ChatWindow: React.FC = () => {
  const {
    getActiveThread,
    isStreaming,
    renameThread,
    clearMessages,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useChatStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeThread = getActiveThread();

  const models = [
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'claude-3-opus',
    'claude-3-sonnet',
  ];

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive or streaming
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread?.messages, isStreaming]);

  const handleTitleEdit = () => {
    if (!activeThread) return;
    if (newTitle.trim() && newTitle !== activeThread.title) {
      renameThread(activeThread.id, newTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleClearContext = () => {
    clearMessages();
    setShowClearConfirm(false);
  };

  if (!activeThread) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to Chat
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Select a conversation from the sidebar or start a new chat to begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg md:hidden"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            
            {/* Title */}
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={handleTitleEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleEdit();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  className="text-lg font-semibold bg-white dark:bg-gray-800 border rounded px-2 py-1 min-w-0 flex-1"
                  autoFocus
                />
                <button
                  onClick={handleTitleEdit}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <Check className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {activeThread.title}
                </h1>
                <button
                  onClick={() => {
                    setNewTitle(activeThread.title);
                    setIsEditingTitle(true);
                  }}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-opacity"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                <span className="text-gray-700 dark:text-gray-300">{selectedModel}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showModelSelector && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowModelSelector(false)}
                  />
                  <div className="absolute right-0 top-10 z-20 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg">
                    {models.map((model) => (
                      <button
                        key={model}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelSelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                          model === selectedModel ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Clear Context */}
            {activeThread.messages.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </button>
                
                {showClearConfirm && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowClearConfirm(false)}
                    />
                    <div className="absolute right-0 top-10 z-20 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        Clear all messages in this conversation?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleClearContext}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {activeThread.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Send a message to begin chatting with the AI assistant.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {activeThread.messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;

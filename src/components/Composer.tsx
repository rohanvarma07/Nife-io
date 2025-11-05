import React, { useRef, useEffect, useState } from 'react';
import { Send, Square, Thermometer } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

interface ComposerProps {
  onSendMessage: (content: string) => void;
  onStopStreaming: () => void;
}

const Composer: React.FC<ComposerProps> = ({ onSendMessage, onStopStreaming }) => {
  const [message, setMessage] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { isStreaming, getActiveThread } = useChatStore();
  const activeThread = getActiveThread();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200; // Max height in pixels
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [message]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      } else if (e.key === 'Escape' && isStreaming) {
        e.preventDefault();
        onStopStreaming();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [message, isStreaming]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || isStreaming || !activeThread) return;
    
    onSendMessage(trimmed);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = message.trim().length > 0 && !isStreaming && activeThread;

  return (
    <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Temperature Slider */}
      <div className="px-6 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Temperature:</span>
          </div>
          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <span className="text-xs text-gray-500 w-8">0</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs text-gray-500 w-8">2</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
              {temperature}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Higher values = more creative, Lower values = more focused
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              !activeThread 
                ? "Create a new chat to start messaging..." 
                : isStreaming 
                ? "AI is responding..." 
                : "Type your message... (Cmd/Ctrl+Enter to send)"
            }
            disabled={!activeThread || isStreaming}
            className="w-full resize-none border dark:border-gray-600 rounded-lg px-4 py-3 pr-24 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '44px' }}
          />
          
          {/* Send/Stop Button */}
          <div className="absolute right-2 bottom-2 flex gap-2">
            {isStreaming ? (
              <button
                onClick={onStopStreaming}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                title="Stop generation (Esc)"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!canSend}
                className={`p-2 rounded-lg transition-colors ${
                  canSend
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
                title="Send message (Cmd/Ctrl+Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Keyboard Shortcuts Info */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Press <kbd className="px-1 bg-gray-100 dark:bg-gray-800 rounded">⌘</kbd>
          <kbd className="px-1 bg-gray-100 dark:bg-gray-800 rounded ml-1">Enter</kbd> to send
          {isStreaming && (
            <>
              {' • '}
              <kbd className="px-1 bg-gray-100 dark:bg-gray-800 rounded">Esc</kbd> to stop
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Composer;

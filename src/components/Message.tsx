import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, User, Bot } from 'lucide-react';
import type { Message as MessageType } from '../types/chat';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 sm:gap-4 p-3 sm:p-4 ${!isUser ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-green-500 text-white'
      }`}>
        {isUser ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
            {isUser ? 'You' : 'Assistant'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(message.timestamp)}
          </span>
          {message.isStreaming && (
            <span className="text-xs text-blue-500 animate-pulse">Typing...</span>
          )}
        </div>
        
        <div className="prose prose-xs sm:prose-sm max-w-none dark:prose-invert">
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm sm:text-base text-gray-900 dark:text-gray-100">
              {message.content}
            </p>
          ) : (
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isBlock = match && className?.includes('language-');
                  return isBlock ? (
                    <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code
                      className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors touch-manipulation"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Message;

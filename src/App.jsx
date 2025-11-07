import { useEffect, useRef } from 'react';
import { useChatStore } from './store/chatStore.js';
import { defaultResponder } from './utils/mockResponder.js';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import Composer from './components/Composer.jsx';

function App() {
  const {
    addMessage,
    updateMessage,
    setIsStreaming,
    getActiveThread,
    createThread,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useChatStore();

  const streamingController = useRef(null);

  // Create initial thread if none exists
  useEffect(() => {
    const activeThread = getActiveThread();
    if (!activeThread) {
      createThread();
    }
  }, []);

  // Handle responsive sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  const handleSendMessage = async (content) => {
    const activeThread = getActiveThread();
    if (!activeThread) return;

    // Add user message
    addMessage({
      role: 'user',
      content,
    });

    // Start streaming response
    setIsStreaming(true);
    
    // Create assistant message placeholder
    let assistantMessageId = '';
    
    // Add assistant message and get its ID
    const activeThreadBefore = getActiveThread();
    addMessage({
      role: 'assistant',
      content: '',
      isStreaming: true,
    });
    
    // Get the ID of the just-added message
    const activeThreadAfter = getActiveThread();
    if (activeThreadAfter && activeThreadAfter.messages.length > activeThreadBefore.messages.length) {
      assistantMessageId = activeThreadAfter.messages[activeThreadAfter.messages.length - 1].id;
    }

    try {
      streamingController.current = new AbortController();
      let accumulatedContent = '';

      const responseIterator = defaultResponder.respond(content, 'llm-style');
      
      for await (const chunk of responseIterator) {
        // Check if streaming was cancelled
        if (streamingController.current?.signal.aborted) {
          break;
        }

        accumulatedContent += chunk;
        
        // Update the message with accumulated content
        updateMessage(assistantMessageId, {
          content: accumulatedContent,
          isStreaming: true,
        });
      }

      // Mark streaming as complete
      if (!streamingController.current?.signal.aborted) {
        updateMessage(assistantMessageId, {
          isStreaming: false,
        });
      }
    } catch (error) {
      console.error('Streaming error:', error);
      updateMessage(assistantMessageId, {
        content: 'Sorry, there was an error generating the response.',
        isStreaming: false,
      });
    } finally {
      setIsStreaming(false);
      streamingController.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (streamingController.current) {
      streamingController.current.abort();
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen h-screen max-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex">
      {/* Sidebar */}
      <div className={`${
        sidebarCollapsed 
          ? 'w-auto' 
          : 'w-80 sm:w-72 lg:w-80 md:relative absolute inset-y-0 left-0 z-30'
      } transition-all duration-300 ease-in-out h-full`}>
        <Sidebar />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <ChatWindow />
        <Composer
          onSendMessage={handleSendMessage}
          onStopStreaming={handleStopStreaming}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
}

export default App;

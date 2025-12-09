import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { ArrowDown, Loader2 } from 'lucide-react';
import { useStreamingChat } from '../hooks/useStreamingChat';

export const ChatArea = () => {
  const {
    getActiveThread,
    isStreaming,
    getThreadTokens,
  } = useChatStore();

  const activeThread = getActiveThread();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const { sendMessage, cancelStreaming } = useStreamingChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [activeThread?.messages, autoScroll]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
      setAutoScroll(isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  const handleCancel = () => {
    cancelStreaming();
  };

  const threadTokens = activeThread ? getThreadTokens(activeThread.id) : null;

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="bg-white border-b px-6 py-4">
        <h2 className="text-xl font-semibold">{activeThread?.name || 'No Thread Selected'}</h2>
        {threadTokens && threadTokens.total > 0 && (
          <div className="text-sm text-gray-600 mt-1">
            Total tokens: {threadTokens.prompt} prompt + {threadTokens.completion} completion ={' '}
            {threadTokens.total} total
          </div>
        )}
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        {activeThread ? (
          <>
            {activeThread.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Start a conversation by typing a message below
              </div>
            ) : (
              <div className="max-w-4xl mx-auto w-full">
                {activeThread.messages.map((message) => (
                  <Message key={message.id} message={message} />
                ))}
                {isStreaming && activeThread.messages[activeThread.messages.length - 1]?.content === '' && (
                  <div className="flex gap-4 p-6 bg-gray-50">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Loader2 size={20} className="text-white animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-500 text-sm">Thinking...</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select or create a thread to start chatting
          </div>
        )}
      </div>

      {showScrollButton && (
        <button
          onClick={() => {
            setAutoScroll(true);
            scrollToBottom();
          }}
          className="absolute bottom-24 right-8 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
          title="Scroll to bottom"
        >
          <ArrowDown size={20} />
        </button>
      )}

      <ChatInput
        onSend={handleSend}
        onCancel={handleCancel}
        isStreaming={isStreaming}
        disabled={!activeThread}
      />
    </div>
  );
};

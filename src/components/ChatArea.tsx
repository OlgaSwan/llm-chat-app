import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { ArrowDown } from 'lucide-react';
import { generateThreadName } from '../utils/autoName';

export const ChatArea = () => {
  const {
    getActiveThread,
    addMessage,
    updateMessage,
    isStreaming,
    setIsStreaming,
    getThreadTokens,
    renameThread,
  } = useChatStore();

  const activeThread = getActiveThread();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

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
    if (!activeThread) return;

    const isFirstMessage = activeThread.messages.length === 0;

    // Add user message
    addMessage(activeThread.id, {
      role: 'user',
      content,
    });

    // Auto-name thread based on first message
    if (isFirstMessage && activeThread.name.startsWith('Thread ')) {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (apiKey) {
        generateThreadName(content, apiKey).then((name) => {
          renameThread(activeThread.id, name);
        });
      }
    }

    // Prepare messages for API
    const messages = [
      ...activeThread.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user' as const, content },
    ];

    // Create assistant message placeholder
    addMessage(activeThread.id, {
      role: 'assistant',
      content: '',
    });

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();
    let accumulatedContent = '';

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages,
          stream: true,
          stream_options: { include_usage: true },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null =
        null;

      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              // Handle content
              if (parsed.choices?.[0]?.delta?.content) {
                accumulatedContent += parsed.choices[0].delta.content;
                // Find the last added assistant message and update it
                const currentThread = useChatStore.getState().getActiveThread();
                const lastMessage = currentThread?.messages[currentThread.messages.length - 1];
                if (lastMessage?.role === 'assistant') {
                  updateMessage(activeThread.id, lastMessage.id, {
                    content: accumulatedContent,
                  });
                }
              }

              // Handle usage
              if (parsed.usage) {
                usage = parsed.usage;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      // Update with final tokens
      if (usage) {
        const currentThread = useChatStore.getState().getActiveThread();
        const lastMessage = currentThread?.messages[currentThread.messages.length - 1];
        if (lastMessage?.role === 'assistant') {
          updateMessage(activeThread.id, lastMessage.id, {
            tokens: {
              prompt: usage.prompt_tokens,
              completion: usage.completion_tokens,
              total: usage.total_tokens,
            },
          });
        }
      }
    } catch (error: unknown) {
      if ((error as Error).name === 'AbortError') {
        console.log('Request cancelled');
      } else {
        console.error('Error streaming response:', error);
        // Update message with error
        const currentThread = useChatStore.getState().getActiveThread();
        const lastMessage = currentThread?.messages[currentThread.messages.length - 1];
        if (lastMessage?.role === 'assistant') {
          updateMessage(activeThread.id, lastMessage.id, {
            content: accumulatedContent || 'Error: Failed to get response',
          });
        }
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const threadTokens = activeThread ? getThreadTokens(activeThread.id) : null;

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h2 className="text-xl font-semibold">{activeThread?.name || 'No Thread Selected'}</h2>
        {threadTokens && threadTokens.total > 0 && (
          <div className="text-sm text-gray-600 mt-1">
            Total tokens: {threadTokens.prompt} prompt + {threadTokens.completion} completion ={' '}
            {threadTokens.total} total
          </div>
        )}
      </div>

      {/* Messages */}
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

      {/* Scroll to bottom button */}
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

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onCancel={handleCancel}
        isStreaming={isStreaming}
        disabled={!activeThread}
      />
    </div>
  );
};

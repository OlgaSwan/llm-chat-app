import { useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { generateThreadName } from '../utils/autoName';

export const useStreamingChat = () => {
  const {
    getActiveThread,
    addMessage,
    updateMessage,
    setIsStreaming,
    renameThread,
  } = useChatStore();

  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = async (content: string) => {
    const activeThread = getActiveThread();
    if (!activeThread) return;

    const isFirstMessage = activeThread.messages.length === 0;

    addMessage(activeThread.id, {
      role: 'user',
      content,
    });

    if (isFirstMessage && activeThread.name.startsWith('Thread ')) {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (apiKey) {
        generateThreadName(content, apiKey).then((name) => {
          renameThread(activeThread.id, name);
        });
      }
    }

    const messages = [
      ...activeThread.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user' as const, content },
    ];

    addMessage(activeThread.id, {
      role: 'assistant',
      content: '',
    });

    const currentThreadState = useChatStore.getState().getActiveThread();
    const assistantMessage = currentThreadState?.messages[currentThreadState.messages.length - 1];
    if (!assistantMessage) return;

    const assistantMessageId = assistantMessage.id;
    const threadId = activeThread.id;

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

              if (parsed.choices?.[0]?.delta?.content) {
                accumulatedContent += parsed.choices[0].delta.content;
                updateMessage(threadId, assistantMessageId, {
                  content: accumulatedContent,
                });
              }

              if (parsed.usage) {
                usage = parsed.usage;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      if (usage) {
        updateMessage(threadId, assistantMessageId, {
          tokens: {
            prompt: usage.prompt_tokens,
            completion: usage.completion_tokens,
            total: usage.total_tokens,
          },
        });
      }
    } catch (error: unknown) {
      if ((error as Error).name === 'AbortError') {
        console.log('Request cancelled');
      } else {
        console.error('Error streaming response:', error);
        updateMessage(threadId, assistantMessageId, {
          content: accumulatedContent || 'Error: Failed to get response',
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const cancelStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return {
    sendMessage,
    cancelStreaming,
  };
};

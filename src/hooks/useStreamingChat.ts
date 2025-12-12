import { useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { generateThreadName } from '../utils/autoName';
import { OpenRouter } from '@openrouter/sdk';

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
        const threadId = activeThread.id;

        addMessage(threadId, {
            role: 'user',
            content,
        });

        if (isFirstMessage && activeThread.name.startsWith('Thread ')) {
            const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
            if (apiKey) {
                generateThreadName(content, apiKey).then((name) => {
                    renameThread(threadId, name);
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

        const assistantMessageId = addMessage(threadId, {
            role: 'assistant',
            content: '',
        });

        setIsStreaming(true);
        abortControllerRef.current = new AbortController();

        try {
            const openRouter = new OpenRouter({
                apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
            });

            const stream = await openRouter.chat.send({
                model: 'openai/gpt-5-mini',
                messages,
                stream: true,
                streamOptions: { includeUsage: true },
            });

            let accumulatedContent = '';
            let usage: { promptTokens?: number; completionTokens?: number; totalTokens?: number } | null = null;

            for await (const chunk of stream) {
                if (abortControllerRef.current?.signal.aborted) {
                    break;
                }

                const delta = chunk.choices?.[0]?.delta?.content;
                if (delta) {
                    accumulatedContent += delta;
                    updateMessage(threadId, assistantMessageId, {
                        content: accumulatedContent,
                    });
                }

                if (chunk.usage) {
                    usage = chunk.usage;
                }
            }

            if (usage && usage.promptTokens && usage.completionTokens && usage.totalTokens) {
                updateMessage(threadId, assistantMessageId, {
                    tokens: {
                        prompt: usage.promptTokens,
                        completion: usage.completionTokens,
                        total: usage.totalTokens,
                    },
                });
            }
        } catch (error: unknown) {
            if ((error as Error).name === 'AbortError') {
                console.log('Request cancelled');
            } else {
                console.error('Error streaming response:', error);
                const currentContent = useChatStore.getState().threads
                    .find(t => t.id === threadId)?.messages
                    .find(m => m.id === assistantMessageId)?.content || '';

                updateMessage(threadId, assistantMessageId, {
                    content: currentContent || 'Error: Failed to get response',
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

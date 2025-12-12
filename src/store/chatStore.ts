import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Thread, Message } from '../types';

interface ChatState {
  threads: Thread[];
  activeThreadId: string | null;
  isStreaming: boolean;

  // Thread operations
  createThread: (name?: string) => string;
  deleteThread: (threadId: string) => void;
  renameThread: (threadId: string, name: string) => void;
  setActiveThread: (threadId: string) => void;

  // Message operations
  addMessage: (threadId: string, message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (threadId: string, messageId: string, updates: Partial<Message>) => void;

  // Streaming state
  setIsStreaming: (isStreaming: boolean) => void;

  // Computed values
  getActiveThread: () => Thread | null;
  getThreadTokens: (threadId: string) => { prompt: number; completion: number; total: number };
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: [],
      activeThreadId: null,
      isStreaming: false,

      createThread: (name?: string) => {
        const id = generateId();
        const threadNumber = get().threads.length + 1;
        const thread: Thread = {
          id,
          name: name || `Thread ${threadNumber}`,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          threads: [...state.threads, thread],
          activeThreadId: id,
        }));

        return id;
      },

      deleteThread: (threadId: string) => {
        set((state) => {
          const newThreads = state.threads.filter((t) => t.id !== threadId);
          const newActiveId = state.activeThreadId === threadId
            ? (newThreads[0]?.id || null)
            : state.activeThreadId;

          return {
            threads: newThreads,
            activeThreadId: newActiveId,
          };
        });
      },

      renameThread: (threadId: string, name: string) => {
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? { ...t, name, updatedAt: Date.now() }
              : t
          ),
        }));
      },

      setActiveThread: (threadId: string) => {
        set({ activeThreadId: threadId });
      },

        addMessage: (threadId: string, message) => {
            const fullMessage: Message = {
                ...message,
                id: generateId(),
                timestamp: Date.now(),
            };

            set((state) => ({
                threads: state.threads.map((thread) =>
                    thread.id === threadId
                        ? { ...thread, messages: [...thread.messages, fullMessage] }
                        : thread
                ),
            }));

            return fullMessage.id;
        },

      updateMessage: (threadId: string, messageId: string, updates) => {
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === messageId ? { ...m, ...updates } : m
                  ),
                  updatedAt: Date.now(),
                }
              : t
          ),
        }));
      },

      setIsStreaming: (isStreaming: boolean) => {
        set({ isStreaming });
      },

      getActiveThread: () => {
        const state = get();
        return state.threads.find((t) => t.id === state.activeThreadId) || null;
      },

      getThreadTokens: (threadId: string) => {
        const thread = get().threads.find((t) => t.id === threadId);
        if (!thread) return { prompt: 0, completion: 0, total: 0 };

        return thread.messages.reduce(
          (acc, msg) => {
            if (msg.tokens) {
              acc.prompt += msg.tokens.prompt || 0;
              acc.completion += msg.tokens.completion || 0;
              acc.total += msg.tokens.total || 0;
            }
            return acc;
          },
          { prompt: 0, completion: 0, total: 0 }
        );
      },
    }),
    {
      name: 'chat-storage',
    }
  )
);

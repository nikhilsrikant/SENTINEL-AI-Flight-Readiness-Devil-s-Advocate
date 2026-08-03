'use client';

import { useCallback, useRef, useState } from 'react';
import { API_BASE_URL } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: ChatSource[];
  isLoading?: boolean;
}

export interface ChatSource {
  id: string;
  title: string;
  relevance_score: number;
  excerpt: string;
}

interface UseChatOptions {
  /** API endpoint for RAG queries (default: knowledge_graph/query) */
  endpoint?: string;
  /** System prompt to prepend to conversations */
  systemPrompt?: string;
  /** Maximum conversation history to send (default: 10) */
  maxHistory?: number;
  /** Callback when a response is received */
  onResponse?: (message: ChatMessage) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

interface UseChatReturn {
  /** All messages in the conversation */
  messages: ChatMessage[];
  /** Whether a response is currently loading */
  isLoading: boolean;
  /** Last error, if any */
  error: Error | null;
  /** Send a message to the knowledge graph */
  sendMessage: (content: string) => Promise<void>;
  /** Clear the conversation history */
  clearMessages: () => void;
  /** Retry the last failed message */
  retry: () => Promise<void>;
}

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Custom hook for managing chat state with the Knowledge Graph RAG endpoint.
 *
 * Features:
 * - Message history management
 * - Loading states with placeholder messages
 * - Error handling and retry
 * - Source citation tracking
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    endpoint = '/api/v1/knowledge_graph/query',
    systemPrompt,
    maxHistory = 10,
    onResponse,
    onError,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (systemPrompt) {
      return [
        {
          id: generateId(),
          role: 'system',
          content: systemPrompt,
          timestamp: new Date(),
        },
      ];
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastUserMessageRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      lastUserMessageRef.current = content;
      setError(null);
      setIsLoading(true);

      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date(),
      };

      // Add loading placeholder for assistant
      const loadingMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      };

      setMessages((prev) => [...prev, userMessage, loadingMessage]);

      try {
        // Build conversation context (last N messages)
        const history = messages
          .filter((m) => m.role !== 'system')
          .slice(-maxHistory)
          .map((m) => ({ role: m.role, content: m.content }));

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: content,
            conversation_history: history,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const responseData = data.data || data;

        const assistantMessage: ChatMessage = {
          id: loadingMessage.id,
          role: 'assistant',
          content: responseData.answer || responseData.response || 'No response received.',
          timestamp: new Date(),
          sources: responseData.sources || [],
          isLoading: false,
        };

        // Replace loading placeholder with actual response
        setMessages((prev) =>
          prev.map((m) => (m.id === loadingMessage.id ? assistantMessage : m))
        );

        onResponse?.(assistantMessage);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was cancelled, remove loading message
          setMessages((prev) => prev.filter((m) => m.id !== loadingMessage.id));
          return;
        }

        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        onError?.(error);

        // Replace loading placeholder with error message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingMessage.id
              ? {
                  ...m,
                  content: 'Sorry, I encountered an error processing your request. Please try again.',
                  isLoading: false,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [isLoading, messages, maxHistory, endpoint, onResponse, onError]
  );

  const clearMessages = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages(
      systemPrompt
        ? [
            {
              id: generateId(),
              role: 'system',
              content: systemPrompt,
              timestamp: new Date(),
            },
          ]
        : []
    );
    setError(null);
    setIsLoading(false);
    lastUserMessageRef.current = null;
  }, [systemPrompt]);

  const retry = useCallback(async () => {
    if (lastUserMessageRef.current) {
      // Remove the last failed assistant message
      setMessages((prev) => {
        const lastIdx = prev.length - 1;
        if (prev[lastIdx]?.role === 'assistant') {
          return prev.slice(0, -1);
        }
        return prev;
      });
      // Remove the last user message too (sendMessage will re-add it)
      setMessages((prev) => {
        const lastIdx = prev.length - 1;
        if (prev[lastIdx]?.role === 'user') {
          return prev.slice(0, -1);
        }
        return prev;
      });
      await sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retry,
  };
}

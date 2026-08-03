'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

interface UseWebSocketOptions {
  /** WebSocket URL to connect to */
  url: string;
  /** Whether to auto-connect on mount (default: true) */
  autoConnect?: boolean;
  /** Maximum reconnection attempts (default: 5) */
  maxRetries?: number;
  /** Base delay for exponential backoff in ms (default: 1000) */
  baseDelay?: number;
  /** Maximum backoff delay in ms (default: 16000) */
  maxDelay?: number;
  /** Callback when a message is received */
  onMessage?: (data: unknown) => void;
  /** Callback when connection opens */
  onOpen?: () => void;
  /** Callback when connection closes */
  onClose?: (event: CloseEvent) => void;
  /** Callback when an error occurs */
  onError?: (event: Event) => void;
}

interface UseWebSocketReturn {
  /** Current connection status */
  status: ConnectionStatus;
  /** Last received message (parsed JSON or raw string) */
  lastMessage: unknown | null;
  /** Send a message through the WebSocket */
  sendMessage: (data: string | object) => void;
  /** Manually connect */
  connect: () => void;
  /** Manually disconnect */
  disconnect: () => void;
  /** Number of buffered messages waiting to send */
  bufferedCount: number;
}

/**
 * Custom hook for WebSocket connection management with exponential backoff reconnection.
 *
 * Features:
 * - Automatic reconnection with exponential backoff (1s, 2s, 4s, 8s, 16s)
 * - Message buffering when disconnected
 * - Connection status tracking
 * - Last message state
 */
export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    autoConnect = true,
    maxRetries = 5,
    baseDelay = 1000,
    maxDelay = 16000,
    onMessage,
    onOpen,
    onClose,
    onError,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<unknown | null>(null);
  const [bufferedCount, setBufferedCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageBufferRef = useRef<(string | object)[]>([]);
  const mountedRef = useRef(true);
  const manualDisconnectRef = useRef(false);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const flushBuffer = useCallback((ws: WebSocket) => {
    while (messageBufferRef.current.length > 0) {
      const msg = messageBufferRef.current.shift();
      if (msg) {
        const payload = typeof msg === 'string' ? msg : JSON.stringify(msg);
        ws.send(payload);
      }
    }
    setBufferedCount(0);
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    manualDisconnectRef.current = false;
    setStatus('connecting');

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setStatus('connected');
        retriesRef.current = 0;
        flushBuffer(ws);
        onOpen?.();
      };

      ws.onmessage = (event: MessageEvent) => {
        if (!mountedRef.current) return;
        let parsed: unknown;
        try {
          parsed = JSON.parse(event.data);
        } catch {
          parsed = event.data;
        }
        setLastMessage(parsed);
        onMessage?.(parsed);
      };

      ws.onclose = (event: CloseEvent) => {
        if (!mountedRef.current) return;
        wsRef.current = null;

        if (manualDisconnectRef.current) {
          setStatus('disconnected');
          onClose?.(event);
          return;
        }

        // Attempt reconnection with exponential backoff
        if (retriesRef.current < maxRetries) {
          setStatus('reconnecting');
          const delay = Math.min(baseDelay * Math.pow(2, retriesRef.current), maxDelay);
          retriesRef.current += 1;

          reconnectTimerRef.current = setTimeout(() => {
            if (mountedRef.current && !manualDisconnectRef.current) {
              connect();
            }
          }, delay);
        } else {
          setStatus('disconnected');
        }

        onClose?.(event);
      };

      ws.onerror = (event: Event) => {
        if (!mountedRef.current) return;
        onError?.(event);
      };

      wsRef.current = ws;
    } catch {
      setStatus('disconnected');
    }
  }, [url, maxRetries, baseDelay, maxDelay, onMessage, onOpen, onClose, onError, flushBuffer]);

  const disconnect = useCallback(() => {
    manualDisconnectRef.current = true;
    clearReconnectTimer();
    retriesRef.current = 0;

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    setStatus('disconnected');
  }, [clearReconnectTimer]);

  const sendMessage = useCallback((data: string | object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      wsRef.current.send(payload);
    } else {
      // Buffer message for when connection is re-established
      messageBufferRef.current.push(data);
      setBufferedCount(messageBufferRef.current.length);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    mountedRef.current = true;

    if (autoConnect) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      clearReconnectTimer();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return {
    status,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    bufferedCount,
  };
}

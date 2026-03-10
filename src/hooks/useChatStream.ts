// src/hooks/useChatStream.ts

import { useState, useCallback, useRef } from "react";
import type { ChatSource, SSEEvent } from "../models/types";

interface StreamState {
  isStreaming: boolean;
  status: string;
  streamedContent: string;
  sources: ChatSource[];
  assistantMessageId: string | null;
  userMessageId: string | null;
  error: string | null;
}

export function useChatStream(projectId: string) {
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    status: "",
    streamedContent: "",
    sources: [],
    assistantMessageId: null,
    userMessageId: null,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const onTitleUpdateRef = useRef<((title: string) => void) | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const sendMessage = useCallback(
    async (
      chatId: string,
      message: string,
      options?: {
        onTitleUpdate?: (title: string) => void;
        onComplete?: () => void;
      }
    ) => {
      onTitleUpdateRef.current = options?.onTitleUpdate ?? null;
      onCompleteRef.current = options?.onComplete ?? null;

      // Abort any existing stream
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        isStreaming: true,
        status: "",
        streamedContent: "",
        sources: [],
        assistantMessageId: null,
        userMessageId: null,
        error: null,
      });

      try {
        const stored = localStorage.getItem("auth");
        const token = stored ? JSON.parse(stored)?.token : null;

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/projects/${projectId}/playground/chats/${chatId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({ message: "Request failed" }));
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            error: err.message || "Request failed",
          }));
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          setState((prev) => ({ ...prev, isStreaming: false, error: "No response stream" }));
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            const jsonStr = trimmed.slice(6);
            if (!jsonStr) continue;

            try {
              const event: SSEEvent = JSON.parse(jsonStr);

              switch (event.type) {
                case "user_message":
                  setState((prev) => ({
                    ...prev,
                    userMessageId: event.messageId,
                  }));
                  break;

                case "status":
                  setState((prev) => ({
                    ...prev,
                    status: event.message,
                  }));
                  break;

                case "chunk":
                  setState((prev) => ({
                    ...prev,
                    streamedContent: prev.streamedContent + event.content,
                    status: "",
                  }));
                  break;

                case "title":
                  onTitleUpdateRef.current?.(event.title);
                  break;

                case "sources":
                  setState((prev) => ({
                    ...prev,
                    sources: event.sources,
                    assistantMessageId: event.messageId,
                  }));
                  break;

                case "done":
                  setState((prev) => ({
                    ...prev,
                    isStreaming: false,
                    assistantMessageId: event.messageId,
                  }));
                  onCompleteRef.current?.();
                  break;

                case "error":
                  setState((prev) => ({
                    ...prev,
                    isStreaming: false,
                    error: event.message,
                  }));
                  break;
              }
            } catch {
              // Ignore malformed JSON
            }
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            error: "Connection failed",
          }));
        }
      }
    },
    [projectId]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isStreaming: false,
      status: "",
      streamedContent: "",
      sources: [],
      assistantMessageId: null,
      userMessageId: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    sendMessage,
    abort,
    reset,
  };
}
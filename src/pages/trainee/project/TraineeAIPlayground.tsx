// src/pages/trainee/project/TraineeAIPlayground.tsx

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { navigate } from "raviger";
import {
  useChats,
  useChatDetail,
  useCreateChat,
  useDeleteChat,
} from "../../../controllers/playground";
import { useChatStream } from "../../../hooks/useChatStream";
import { useQueryClient } from "@tanstack/react-query";
import MarkdownRenderer from "../../../components/MarkdownRenderer";
import { Button } from "../../../components/ui/button";
import {
  Plus,
  Send,
  Trash2,
  MessageSquare,
  Sparkles,
  Loader2,
  FileText,
  ExternalLink,
  Bot,
  User,
  Search,
  StopCircle,
} from "lucide-react";
import type {
//   ChatMessage,
  ChatSource,
  ChatWithCount,
} from "../../../models/types";
import { useProject } from "@/hooks/useProject";

export default function TraineeAIPlayground() {
  const { project } = useProject();
  const queryClient = useQueryClient();
  const [lastSentMessage, setLastSentMessage] = useState("");
  // Chat list
  const { data: chatListData, isLoading: isLoadingChats } = useChats(
    project.id,
  );
  const chats = chatListData?.chats ?? [];

  // Active chat
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const { data: chatDetailData, isLoading: isLoadingDetail } = useChatDetail(
    project.id,
    activeChatId,
  );

  // Mutations
  const createChat = useCreateChat(project.id);
  const deleteChat = useDeleteChat(project.id);

  // Streaming
  const stream = useChatStream(project.id);

  // Input
  const [input, setInput] = useState("");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Messages from loaded chat
  const loadedMessages = useMemo(() => {
    return chatDetailData?.chat?.messages ?? [];
  }, [chatDetailData]);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [loadedMessages, stream.streamedContent, scrollToBottom]);

  // Filter chats
  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(sidebarSearch.toLowerCase()),
  );

  // Create new chat
  const handleNewChat = () => {
    createChat.mutate(
      {},
      {
        onSuccess: (data) => {
          setActiveChatId(data.chat.id);
          stream.reset();
          inputRef.current?.focus();
        },
      },
    );
  };

  // Send message
  const handleSend = () => {
    const msg = input.trim();
    if (!msg || !activeChatId || stream.isStreaming) return;

    setLastSentMessage(msg);
    setInput("");
    stream.sendMessage(activeChatId, msg, {
      onTitleUpdate: () => {
        queryClient.invalidateQueries({
          queryKey: ["projects", project.id, "chats"],
        });
      },
      onComplete: () => {
        queryClient.invalidateQueries({
          queryKey: ["projects", project.id, "chats", activeChatId],
        });
        queryClient.invalidateQueries({
          queryKey: ["projects", project.id, "chats"],
        });
      },
    });
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Delete chat
  const handleDelete = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirm === chatId) {
      deleteChat.mutate(chatId, {
        onSuccess: () => {
          if (activeChatId === chatId) {
            setActiveChatId(null);
            stream.reset();
          }
          setDeleteConfirm(null);
        },
      });
    } else {
      setDeleteConfirm(chatId);
    }
  };

  // Navigate to resource
  const handleSourceClick = (source: ChatSource) => {
    navigate(`/projects/${project.id}/resources?file=${source.resourceId}`);
  };

  // Build display messages: loaded + streaming
  //   const displayMessages: (
  //     | ChatMessage
  //     | {
  //         role: "USER" | "ASSISTANT";
  //         content: string;
  //         sources: ChatSource[];
  //         id: string;
  //       }
  //   )[] = [...loadedMessages];

  // If streaming, add the in-progress messages
  //   if (
  //     stream.userMessageId &&
  //     !loadedMessages.find((m) => m.id === stream.userMessageId)
  //   ) {
  //     // The user message might not be in loaded yet
  //   }
  //   if (stream.streamedContent || stream.isStreaming) {
  //     // Check if assistant message is already in loaded
  //     if (
  //       !stream.assistantMessageId ||
  //       !loadedMessages.find((m) => m.id === stream.assistantMessageId)
  //     ) {
  //       if (stream.streamedContent) {
  //         displayMessages.push({
  //           id: "streaming",
  //           role: "ASSISTANT",
  //           content: stream.streamedContent,
  //           sources: stream.sources,
  //         });
  //       }
  //     }
  //   }

  // Build display messages: loaded + streaming
  const displayMessages: {
    id: string;
    role: "USER" | "ASSISTANT";
    content: string;
    sources: ChatSource[];
  }[] = [...loadedMessages];

  // If streaming, add the user message that was just sent
  if (stream.isStreaming || stream.streamedContent) {
    // Add user message if not already in loaded messages
    if (
      stream.userMessageId &&
      !loadedMessages.find((m) => m.id === stream.userMessageId)
    ) {
      displayMessages.push({
        id: stream.userMessageId,
        role: "USER",
        content: input || lastSentMessage,
        sources: [],
      });
    }

    // Add assistant streaming message if not already in loaded messages
    if (
      !stream.assistantMessageId ||
      !loadedMessages.find((m) => m.id === stream.assistantMessageId)
    ) {
      if (stream.streamedContent || stream.isStreaming) {
        displayMessages.push({
          id: "streaming",
          role: "ASSISTANT",
          content: stream.streamedContent,
          sources: stream.sources,
        });
      }
    }
  }
  return (
    <div className="flex h-full">
      {/* ===== Sidebar — Chat List ===== */}
      <div className="flex w-72 flex-col border-r border-gray-200 bg-white">
        {/* New Chat Button */}
        <div className="border-b border-gray-100 p-3">
          <Button
            onClick={handleNewChat}
            disabled={createChat.isPending}
            className="w-full gap-2"
            size="sm"
          >
            {createChat.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-50 px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="h-7 w-full rounded-md border border-gray-200 bg-gray-50 pl-7 pr-2 text-[11px] outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingChats && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            </div>
          )}

          {!isLoadingChats && filteredChats.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Sparkles className="mx-auto mb-2 h-6 w-6 text-gray-300" />
              <p className="text-xs text-gray-400">
                {chats.length === 0
                  ? "Start a new chat to begin"
                  : "No matching chats"}
              </p>
            </div>
          )}

          {filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isActive={activeChatId === chat.id}
              isDeleteConfirm={deleteConfirm === chat.id}
              onClick={() => {
                setActiveChatId(chat.id);
                stream.reset();
                setDeleteConfirm(null);
              }}
              onDelete={(e) => handleDelete(chat.id, e)}
              onCancelDelete={() => setDeleteConfirm(null)}
            />
          ))}
        </div>
      </div>

      {/* ===== Main Chat Area ===== */}
      <div className="flex flex-1 flex-col bg-gray-50">
        {!activeChatId ? (
          /* Empty State */
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <Sparkles className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">AI Playground</h2>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Ask questions about your project resources. The AI will search
              through uploaded materials to provide accurate answers.
            </p>
            <Button onClick={handleNewChat} className="mt-6 gap-2">
              <Plus className="h-4 w-4" />
              Start a conversation
            </Button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="mx-auto max-w-3xl space-y-6">
                {isLoadingDetail && (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                  </div>
                )}

                {!isLoadingDetail &&
                  displayMessages.length === 0 &&
                  !stream.isStreaming && (
                    <div className="flex flex-col items-center py-16 text-center">
                      <Sparkles className="mb-3 h-10 w-10 text-emerald-300" />
                      <p className="text-sm text-gray-500">
                        Ask anything about your project resources
                      </p>
                    </div>
                  )}

                {displayMessages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isStreaming={msg.id === "streaming" && stream.isStreaming}
                    onSourceClick={handleSourceClick}
                  />
                ))}

                {/* Status indicator */}
                {stream.isStreaming &&
                  stream.status &&
                  !stream.streamedContent && (
                    <div className="flex items-center gap-2 px-12">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                      <span className="text-xs text-gray-500">
                        {stream.status}
                      </span>
                    </div>
                  )}

                {/* Error */}
                {stream.error && (
                  <div className="mx-12 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {stream.error}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white px-4 py-3">
              <div className="mx-auto max-w-3xl">
                <div className="flex items-end gap-3 rounded-xl border border-gray-200 bg-gray-50 p-2 transition-colors focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your project resources..."
                    rows={1}
                    className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-gray-400"
                    style={{
                      height: "auto",
                      overflow: "hidden",
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                    }}
                  />

                  {stream.isStreaming ? (
                    <button
                      onClick={stream.abort}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors hover:bg-red-200"
                    >
                      <StopCircle className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-center text-[10px] text-gray-400">
                  AI answers are generated from project resources and may not
                  always be accurate
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ===== Chat List Item =====

function ChatListItem({
  chat,
  isActive,
  isDeleteConfirm,
  onClick,
  onDelete,
  onCancelDelete,
}: {
  chat: ChatWithCount;
  isActive: boolean;
  isDeleteConfirm: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onCancelDelete: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer border-b border-gray-50 px-3 py-3 transition-colors ${
        isActive ? "bg-emerald-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <MessageSquare
          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
            isActive ? "text-emerald-600" : "text-gray-400"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-xs font-medium ${
              isActive ? "text-emerald-900" : "text-gray-700"
            }`}
          >
            {chat.title}
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400">
            {chat._count.messages} messages
          </p>
        </div>

        {/* Delete */}
        {isDeleteConfirm ? (
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onDelete}
              className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancelDelete();
              }}
              className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={onDelete}
            className="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ===== Message Bubble =====

function MessageBubble({
  message,
  isStreaming,
  onSourceClick,
}: {
  message: {
    id: string;
    role: "USER" | "ASSISTANT";
    content: string;
    sources: ChatSource[];
  };
  isStreaming?: boolean;
  onSourceClick: (source: ChatSource) => void;
}) {
  const isUser = message.role === "USER";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-emerald-100" : "bg-gray-100"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-emerald-700" />
        ) : (
          <Bot className="h-4 w-4 text-gray-600" />
        )}
      </div>

      {/* Content */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isUser
              ? "bg-emerald-600 text-white"
              : "border border-gray-200 bg-white text-gray-800"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-sm">
              <MarkdownRenderer content={message.content} />
              {isStreaming && (
                <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              )}
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources.length > 0 && (
          <div className="mt-2 space-y-1.5">
            <p className="px-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
              Sources
            </p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source) => (
                <SourceCard
                  key={source.id}
                  source={source}
                  onClick={() => onSourceClick(source)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Source Card =====

function SourceCard({
  source,
  onClick,
}: {
  source: ChatSource;
  onClick: () => void;
}) {
  const relevance = Math.round(source.score * 100);

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left transition-all hover:border-emerald-200 hover:shadow-sm"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-50">
        <FileText className="h-3.5 w-3.5 text-emerald-600" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-gray-700 group-hover:text-emerald-700">
          {source.filename.replace(/\.pdf$/i, "")}
        </p>
        <p className="text-[10px] text-gray-400">{relevance}% relevant</p>
      </div>
      <ExternalLink className="h-3 w-3 shrink-0 text-gray-300 group-hover:text-emerald-500" />
    </button>
  );
}

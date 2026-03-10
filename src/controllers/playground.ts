// src/controllers/playground.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type {
  ChatListResponse,
  ChatDetailResponse,
  CreateChatRequest,
  CreateChatResponse,
  DeleteChatResponse,
  ApiError,
} from "../models/types";
import type { AxiosError } from "axios";

export function useChats(projectId: string) {
  return useQuery<ChatListResponse, AxiosError<ApiError>>({
    queryKey: ["projects", projectId, "chats"],
    queryFn: async () => {
      const response = await api.get<ChatListResponse>(
        `/projects/${projectId}/playground/chats`
      );
      return response.data;
    },
    enabled: !!projectId,
  });
}

export function useChatDetail(projectId: string, chatId: string | null) {
  return useQuery<ChatDetailResponse, AxiosError<ApiError>>({
    queryKey: ["projects", projectId, "chats", chatId],
    queryFn: async () => {
      const response = await api.get<ChatDetailResponse>(
        `/projects/${projectId}/playground/chats/${chatId}`
      );
      return response.data;
    },
    enabled: !!projectId && !!chatId,
  });
}

export function useCreateChat(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<CreateChatResponse, AxiosError<ApiError>, CreateChatRequest>({
    mutationFn: async (data) => {
      const response = await api.post<CreateChatResponse>(
        `/projects/${projectId}/playground/chats`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "chats"],
      });
    },
  });
}

export function useDeleteChat(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<DeleteChatResponse, AxiosError<ApiError>, string>({
    mutationFn: async (chatId) => {
      const response = await api.delete<DeleteChatResponse>(
        `/projects/${projectId}/playground/chats/${chatId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "chats"],
      });
    },
  });
}
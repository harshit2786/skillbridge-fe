// src/controllers/resources.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type {
  ResourceListResponse,
  ResourceDetailResponse,
  ResourceUploadResponse,
  DeleteResourceResponse,
  ApiError,
} from "../models/types";
import type { AxiosError } from "axios";

export function useResources(projectId: string) {
  return useQuery<ResourceListResponse, AxiosError<ApiError>>({
    queryKey: ["projects", projectId, "resources"],
    queryFn: async () => {
      const response = await api.get<ResourceListResponse>(
        `/projects/${projectId}/resources`
      );
      return response.data;
    },
    enabled: !!projectId,
  });
}

export function useResourceDetail(projectId: string, resourceId: string) {
  return useQuery<ResourceDetailResponse, AxiosError<ApiError>>({
    queryKey: ["projects", projectId, "resources", resourceId],
    queryFn: async () => {
      const response = await api.get<ResourceDetailResponse>(
        `/projects/${projectId}/resources/${resourceId}`
      );
      return response.data;
    },
    enabled: !!projectId && !!resourceId,
  });
}

export function useUploadResource(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ResourceUploadResponse, AxiosError<ApiError>, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post<ResourceUploadResponse>(
        `/projects/${projectId}/resources`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "resources"],
      });
    },
  });
}

export function useDeleteResource(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<DeleteResourceResponse, AxiosError<ApiError>, string>({
    mutationFn: async (resourceId) => {
      const response = await api.delete<DeleteResourceResponse>(
        `/projects/${projectId}/resources/${resourceId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "resources"],
      });
    },
  });
}
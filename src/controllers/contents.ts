// src/controllers/contents.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type {
  ProjectContentsResponse,
  ReorderContentsRequest,
  ReorderContentsResponse,
  ApiError,
} from "../models/types";
import type { AxiosError } from "axios";

export function useProjectContents(projectId: string) {
  return useQuery<ProjectContentsResponse, AxiosError<ApiError>>({
    queryKey: ["projects", projectId, "contents"],
    queryFn: async () => {
      const res = await api.get<ProjectContentsResponse>(
        `/projects/${projectId}/contents`
      );
      return res.data;
    },
    enabled: !!projectId,
  });
}

export function useReorderContents(projectId: string) {
  const qc = useQueryClient();
  return useMutation<
    ReorderContentsResponse,
    AxiosError<ApiError>,
    ReorderContentsRequest
  >({
    mutationFn: async (data) => {
      const res = await api.put<ReorderContentsResponse>(
        `/projects/${projectId}/contents/reorder`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["projects", projectId, "contents"],
      });
    },
  });
}
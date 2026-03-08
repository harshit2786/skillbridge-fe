import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { ProjectDetailResponse, ApiError } from "../models/types";
import type { AxiosError } from "axios";

export function useProjectDetail(projectId: string, enabled: boolean = true) {
  return useQuery<ProjectDetailResponse, AxiosError<ApiError>>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await api.get<ProjectDetailResponse>(
        `/projects/${projectId}`
      );
      return response.data;
    },
    enabled: !!projectId && enabled,
  });
}
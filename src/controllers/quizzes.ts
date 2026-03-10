// src/controllers/quizzes.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type {
  QuizListResponse,
  QuizDetailResponse,
  CreateQuizRequest,
  CreateQuizResponse,
  AddCreatorsRequest,
  AddCreatorsResponse,
  RemoveCreatorResponse,
  TogglePublishResponse,
  CreateSectionRequest,
  CreateSectionResponse,
  UpdateSectionRequest,
  UpdateSectionResponse,
  DeleteSectionResponse,
  ReorderSectionsRequest,
  ReorderSectionsResponse,
  ApiError,
} from "../models/types";
import type { AxiosError } from "axios";

// --- Quiz ---

export function useQuizzes(projectId: string) {
  return useQuery<QuizListResponse, AxiosError<ApiError>>({
    queryKey: ["projects", projectId, "quizzes"],
    queryFn: async () => {
      const res = await api.get<QuizListResponse>(
        `/projects/${projectId}/quizzes`
      );
      return res.data;
    },
    enabled: !!projectId,
  });
}

export function useQuizDetail(projectId: string, quizId: string | null) {
  return useQuery<QuizDetailResponse, AxiosError<ApiError>>({
    queryKey: ["projects", projectId, "quizzes", quizId],
    queryFn: async () => {
      const res = await api.get<QuizDetailResponse>(
        `/projects/${projectId}/quizzes/${quizId}`
      );
      return res.data;
    },
    enabled: !!projectId && !!quizId,
  });
}

export function useCreateQuiz(projectId: string) {
  const qc = useQueryClient();
  return useMutation<CreateQuizResponse, AxiosError<ApiError>, CreateQuizRequest>({
    mutationFn: async (data) => {
      const res = await api.post<CreateQuizResponse>(
        `/projects/${projectId}/quizzes`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "quizzes"] });
    },
  });
}

export function useAddCreators(projectId: string, quizId: string) {
  const qc = useQueryClient();
  return useMutation<AddCreatorsResponse, AxiosError<ApiError>, AddCreatorsRequest>({
    mutationFn: async (data) => {
      const res = await api.post<AddCreatorsResponse>(
        `/projects/${projectId}/quizzes/${quizId}/creators`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "quizzes", quizId] });
      qc.invalidateQueries({ queryKey: ["projects", projectId, "quizzes"] });
    },
  });
}

export function useRemoveCreator(projectId: string, quizId: string) {
  const qc = useQueryClient();
  return useMutation<RemoveCreatorResponse, AxiosError<ApiError>, string>({
    mutationFn: async (trainerId) => {
      const res = await api.delete<RemoveCreatorResponse>(
        `/projects/${projectId}/quizzes/${quizId}/creators/${trainerId}`
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "quizzes", quizId] });
      qc.invalidateQueries({ queryKey: ["projects", projectId, "quizzes"] });
    },
  });
}

export function useTogglePublish(projectId: string, quizId: string) {
  const qc = useQueryClient();
  return useMutation<TogglePublishResponse, AxiosError<ApiError>>({
    mutationFn: async () => {
      const res = await api.patch<TogglePublishResponse>(
        `/projects/${projectId}/quizzes/${quizId}/publish`
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "quizzes", quizId] });
      qc.invalidateQueries({ queryKey: ["projects", projectId, "quizzes"] });
    },
  });
}

// --- Sections ---

export function useCreateSection(projectId: string, quizId: string) {
  const qc = useQueryClient();
  return useMutation<CreateSectionResponse, AxiosError<ApiError>, CreateSectionRequest>({
    mutationFn: async (data) => {
      const res = await api.post<CreateSectionResponse>(
        `/projects/${projectId}/quizzes/${quizId}/sections`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "quizzes", quizId] });
    },
  });
}

export function useUpdateSection(projectId: string, quizId: string, sectionId: string) {
  const qc = useQueryClient();
  return useMutation<UpdateSectionResponse, AxiosError<ApiError>, UpdateSectionRequest>({
    mutationFn: async (data) => {
      const res = await api.patch<UpdateSectionResponse>(
        `/projects/${projectId}/quizzes/${quizId}/sections/${sectionId}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "quizzes", quizId] });
    },
  });
}

export function useDeleteSection(projectId: string, quizId: string) {
  const qc = useQueryClient();
  return useMutation<DeleteSectionResponse, AxiosError<ApiError>, string>({
    mutationFn: async (sectionId) => {
      const res = await api.delete<DeleteSectionResponse>(
        `/projects/${projectId}/quizzes/${quizId}/sections/${sectionId}`
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "quizzes", quizId] });
    },
  });
}

export function useReorderSections(projectId: string, quizId: string) {
  const qc = useQueryClient();
  return useMutation<ReorderSectionsResponse, AxiosError<ApiError>, ReorderSectionsRequest>({
    mutationFn: async (data) => {
      const res = await api.put<ReorderSectionsResponse>(
        `/projects/${projectId}/quizzes/${quizId}/sections/reorder`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "quizzes", quizId] });
    },
  });
}
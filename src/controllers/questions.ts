

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type {
  QuestionListResponse,
  QuestionDetailResponse,
  CreateQuestionRequest,
  CreateQuestionResponse,
  UpdateQuestionRequest,
  UpdateQuestionResponse,
  DeleteQuestionResponse,
  ReorderQuestionsRequest,
  ReorderQuestionsResponse,
} from "../types/quiz";

import type { AxiosError } from "axios";
import type { ApiError, ContentType } from "@/models/types";

const basePath = (
  projectId: string,
  contentType: ContentType,
  contentId: string,
  sectionId: string
) =>
  `/projects/${projectId}/${contentType}/${contentId}/sections/${sectionId}/questions`;

const questionsKey = (
  projectId: string,
  contentType: ContentType,
  contentId: string,
  sectionId: string
) => [
  "projects",
  projectId,
  contentType,
  contentId,
  "sections",
  sectionId,
  "questions",
];

export function useQuestions(
  projectId: string,
  contentType: ContentType,
  contentId: string,
  sectionId: string
) {
  return useQuery<QuestionListResponse, AxiosError<ApiError>>({
    queryKey: questionsKey(projectId, contentType, contentId, sectionId),
    queryFn: async () => {
      const res = await api.get<QuestionListResponse>(
        basePath(projectId, contentType, contentId, sectionId)
      );
      return res.data;
    },
    enabled: !!projectId && !!contentId && !!sectionId,
  });
}

export function useQuestionDetail(
  projectId: string,
  contentType: ContentType,
  contentId: string,
  sectionId: string,
  questionId: string | null
) {
  return useQuery<QuestionDetailResponse, AxiosError<ApiError>>({
    queryKey: [
      ...questionsKey(projectId, contentType, contentId, sectionId),
      questionId,
    ],
    queryFn: async () => {
      const res = await api.get<QuestionDetailResponse>(
        `${basePath(projectId, contentType, contentId, sectionId)}/${questionId}`
      );
      return res.data;
    },
    enabled: !!projectId && !!contentId && !!sectionId && !!questionId,
  });
}

export function useCreateQuestion(
  projectId: string,
  contentType: ContentType,
  contentId: string,
  sectionId: string
) {
  const qc = useQueryClient();
  return useMutation<
    CreateQuestionResponse,
    AxiosError<ApiError>,
    CreateQuestionRequest
  >({
    mutationFn: async (data) => {
      const res = await api.post<CreateQuestionResponse>(
        basePath(projectId, contentType, contentId, sectionId),
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: questionsKey(projectId, contentType, contentId, sectionId),
      });
      qc.invalidateQueries({
        queryKey: ["projects", projectId, contentType, contentId],
      });
    },
  });
}

export function useUpdateQuestion(
  projectId: string,
  contentType: ContentType,
  contentId: string,
  sectionId: string,
  questionId: string
) {
  const qc = useQueryClient();
  return useMutation<
    UpdateQuestionResponse,
    AxiosError<ApiError>,
    UpdateQuestionRequest
  >({
    mutationFn: async (data) => {
      const res = await api.patch<UpdateQuestionResponse>(
        `${basePath(projectId, contentType, contentId, sectionId)}/${questionId}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: questionsKey(projectId, contentType, contentId, sectionId),
      });
    },
  });
}

export function useDeleteQuestion(
  projectId: string,
  contentType: ContentType,
  contentId: string,
  sectionId: string
) {
  const qc = useQueryClient();
  return useMutation<DeleteQuestionResponse, AxiosError<ApiError>, string>({
    mutationFn: async (questionId) => {
      const res = await api.delete<DeleteQuestionResponse>(
        `${basePath(projectId, contentType, contentId, sectionId)}/${questionId}`
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: questionsKey(projectId, contentType, contentId, sectionId),
      });
      qc.invalidateQueries({
        queryKey: ["projects", projectId, contentType, contentId],
      });
    },
  });
}

export function useReorderQuestions(
  projectId: string,
  contentType: ContentType,
  contentId: string,
  sectionId: string
) {
  const qc = useQueryClient();
  return useMutation<
    ReorderQuestionsResponse,
    AxiosError<ApiError>,
    ReorderQuestionsRequest
  >({
    mutationFn: async (data) => {
      const res = await api.put<ReorderQuestionsResponse>(
        `${basePath(projectId, contentType, contentId, sectionId)}/reorder`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: questionsKey(projectId, contentType, contentId, sectionId),
      });
    },
  });
}
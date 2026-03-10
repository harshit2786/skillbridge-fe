// src/controllers/questions.ts

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
import type { ApiError } from "@/models/types";

const basePath = (projectId: string, quizId: string, sectionId: string) =>
  `/projects/${projectId}/quizzes/${quizId}/sections/${sectionId}/questions`;

const questionsKey = (projectId: string, quizId: string, sectionId: string) => [
  "projects",
  projectId,
  "quizzes",
  quizId,
  "sections",
  sectionId,
  "questions",
];

export function useQuestions(
  projectId: string,
  quizId: string,
  sectionId: string
) {
  return useQuery<QuestionListResponse, AxiosError<ApiError>>({
    queryKey: questionsKey(projectId, quizId, sectionId),
    queryFn: async () => {
      const res = await api.get<QuestionListResponse>(
        basePath(projectId, quizId, sectionId)
      );
      return res.data;
    },
    enabled: !!projectId && !!quizId && !!sectionId,
  });
}

export function useQuestionDetail(
  projectId: string,
  quizId: string,
  sectionId: string,
  questionId: string | null
) {
  return useQuery<QuestionDetailResponse, AxiosError<ApiError>>({
    queryKey: [...questionsKey(projectId, quizId, sectionId), questionId],
    queryFn: async () => {
      const res = await api.get<QuestionDetailResponse>(
        `${basePath(projectId, quizId, sectionId)}/${questionId}`
      );
      return res.data;
    },
    enabled: !!projectId && !!quizId && !!sectionId && !!questionId,
  });
}

export function useCreateQuestion(
  projectId: string,
  quizId: string,
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
        basePath(projectId, quizId, sectionId),
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: questionsKey(projectId, quizId, sectionId),
      });
      // Also refresh section count in quiz detail
      qc.invalidateQueries({
        queryKey: ["projects", projectId, "quizzes", quizId],
      });
    },
  });
}

export function useUpdateQuestion(
  projectId: string,
  quizId: string,
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
        `${basePath(projectId, quizId, sectionId)}/${questionId}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: questionsKey(projectId, quizId, sectionId),
      });
    },
  });
}

export function useDeleteQuestion(
  projectId: string,
  quizId: string,
  sectionId: string
) {
  const qc = useQueryClient();
  return useMutation<DeleteQuestionResponse, AxiosError<ApiError>, string>({
    mutationFn: async (questionId) => {
      const res = await api.delete<DeleteQuestionResponse>(
        `${basePath(projectId, quizId, sectionId)}/${questionId}`
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: questionsKey(projectId, quizId, sectionId),
      });
      qc.invalidateQueries({
        queryKey: ["projects", projectId, "quizzes", quizId],
      });
    },
  });
}

export function useReorderQuestions(
  projectId: string,
  quizId: string,
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
        `${basePath(projectId, quizId, sectionId)}/reorder`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: questionsKey(projectId, quizId, sectionId),
      });
    },
  });
}
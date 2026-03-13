import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type { AxiosError } from "axios";
import type { ApiError } from "../models/types";
import type {
  GetProgressResponse,
  StartLearningResponse,
  GetContentDetailsResponse,
  GetCourseProgressResponse,
  GetCourseSectionQuestionsResponse,
  SubmitCourseAnswerRequest,
  SubmitCourseAnswerResponse,
  GetQuizProgressResponse,
  GetQuizSectionQuestionsResponse,
  SubmitQuizResponseRequest,
  SubmitQuizResponseResponse,
  CompleteQuizResponse,
  GetQuizResultResponse,
  CompleteCourseSectionResponse,
} from "../types/learn";

// ─── Query Keys ──────────────────────────────────────────────────

const learnKeys = {
  progress: (projectId: string) =>
    ["projects", projectId, "learn", "progress"] as const,

  contentDetail: (projectId: string, contentId: string) =>
    ["projects", projectId, "learn", "content", contentId] as const,

  courseProgress: (projectId: string, courseId: string) =>
    ["projects", projectId, "learn", "courses", courseId] as const,

  courseSectionQuestions: (
    projectId: string,
    courseId: string,
    sectionId: string
  ) =>
    [
      "projects", projectId, "learn", "courses", courseId,
      "sections", sectionId, "questions",
    ] as const,

  quizProgress: (projectId: string, quizId: string) =>
    ["projects", projectId, "learn", "quizzes", quizId] as const,

  quizSectionQuestions: (
    projectId: string,
    quizId: string,
    sectionId: string
  ) =>
    [
      "projects", projectId, "learn", "quizzes", quizId,
      "sections", sectionId, "questions",
    ] as const,

  quizResult: (projectId: string, quizId: string) =>
    ["projects", projectId, "learn", "quizzes", quizId, "result"] as const,
};

// ─── GET /learn/progress ─────────────────────────────────────────

export function useLearnProgress(projectId: string) {
  return useQuery<GetProgressResponse, AxiosError<ApiError>>({
    queryKey: learnKeys.progress(projectId),
    queryFn: async () => {
      const res = await api.get<GetProgressResponse>(
        `/projects/${projectId}/learn/progress`
      );
      return res.data;
    },
    enabled: !!projectId,
  });
}

// ─── POST /learn/start ───────────────────────────────────────────

export function useStartLearning(projectId: string) {
  const qc = useQueryClient();
  return useMutation<StartLearningResponse, AxiosError<ApiError>>({
    mutationFn: async () => {
      const res = await api.post<StartLearningResponse>(
        `/projects/${projectId}/learn/start`
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: learnKeys.progress(projectId),
      });
    },
  });
}

// ─── GET /learn/content/:contentId ───────────────────────────────

export function useContentDetails(projectId: string, contentId: string | null) {
  return useQuery<GetContentDetailsResponse, AxiosError<ApiError>>({
    queryKey: learnKeys.contentDetail(projectId, contentId ?? ""),
    queryFn: async () => {
      const res = await api.get<GetContentDetailsResponse>(
        `/projects/${projectId}/learn/content/${contentId}`
      );
      return res.data;
    },
    enabled: !!projectId && !!contentId,
  });
}

// ═════════════════════════════════════════════════════════════════
// ─── COURSE HOOKS ────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════

// GET /learn/courses/:courseId
export function useCourseLearnProgress(projectId: string, courseId: string | null) {
  return useQuery<GetCourseProgressResponse, AxiosError<ApiError>>({
    queryKey: learnKeys.courseProgress(projectId, courseId ?? ""),
    queryFn: async () => {
      const res = await api.get<GetCourseProgressResponse>(
        `/projects/${projectId}/learn/courses/${courseId}`
      );
      return res.data;
    },
    enabled: !!projectId && !!courseId,
  });
}

// GET /learn/courses/:courseId/sections/:sectionId/questions
export function useCourseSectionQuestions(
  projectId: string,
  courseId: string | null,
  sectionId: string | null
) {
  return useQuery<GetCourseSectionQuestionsResponse, AxiosError<ApiError>>({
    queryKey: learnKeys.courseSectionQuestions(
      projectId,
      courseId ?? "",
      sectionId ?? ""
    ),
    queryFn: async () => {
      const res = await api.get<GetCourseSectionQuestionsResponse>(
        `/projects/${projectId}/learn/courses/${courseId}/sections/${sectionId}/questions`
      );
      return res.data;
    },
    enabled: !!projectId && !!courseId && !!sectionId,
  });
}

// POST /learn/courses/:courseId/sections/:sectionId/questions/:questionId/submit
export function useSubmitCourseAnswer(
  projectId: string,
  courseId: string,
  sectionId: string
) {
  const qc = useQueryClient();
  return useMutation<
    SubmitCourseAnswerResponse,
    AxiosError<ApiError>,
    { questionId: string; answer: SubmitCourseAnswerRequest["answer"] }
  >({
    mutationFn: async ({ questionId, answer }) => {
      const res = await api.post<SubmitCourseAnswerResponse>(
        `/projects/${projectId}/learn/courses/${courseId}/sections/${sectionId}/questions/${questionId}/submit`,
        { answer }
      );
      return res.data;
    },
    onSuccess: (data) => {
      // Refetch section questions to update completion status
      qc.invalidateQueries({
        queryKey: learnKeys.courseSectionQuestions(
          projectId,
          courseId,
          sectionId
        ),
      });

      // If section or course completed, refetch course progress + overall progress
      if (data.sectionCompleted || data.courseCompleted) {
        qc.invalidateQueries({
          queryKey: learnKeys.courseProgress(projectId, courseId),
        });
        qc.invalidateQueries({
          queryKey: learnKeys.progress(projectId),
        });
      }
    },
  });
}

// ═════════════════════════════════════════════════════════════════
// ─── QUIZ HOOKS ──────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════

// GET /learn/quizzes/:quizId
export function useQuizLearnProgress(projectId: string, quizId: string | null) {
  return useQuery<GetQuizProgressResponse, AxiosError<ApiError>>({
    queryKey: learnKeys.quizProgress(projectId, quizId ?? ""),
    queryFn: async () => {
      const res = await api.get<GetQuizProgressResponse>(
        `/projects/${projectId}/learn/quizzes/${quizId}`
      );
      return res.data;
    },
    enabled: !!projectId && !!quizId,
  });
}

// GET /learn/quizzes/:quizId/sections/:sectionId/questions
export function useQuizSectionQuestions(
  projectId: string,
  quizId: string | null,
  sectionId: string | null
) {
  return useQuery<GetQuizSectionQuestionsResponse, AxiosError<ApiError>>({
    queryKey: learnKeys.quizSectionQuestions(
      projectId,
      quizId ?? "",
      sectionId ?? ""
    ),
    queryFn: async () => {
      const res = await api.get<GetQuizSectionQuestionsResponse>(
        `/projects/${projectId}/learn/quizzes/${quizId}/sections/${sectionId}/questions`
      );
      return res.data;
    },
    enabled: !!projectId && !!quizId && !!sectionId,
  });
}

// POST /learn/quizzes/:quizId/sections/:sectionId/questions/:questionId/submit
export function useSubmitQuizResponse(
  projectId: string,
  quizId: string,
  sectionId: string
) {
  const qc = useQueryClient();
  return useMutation<
    SubmitQuizResponseResponse,
    AxiosError<ApiError>,
    { questionId: string; answer: SubmitQuizResponseRequest["answer"] }
  >({
    mutationFn: async ({ questionId, answer }) => {
      const res = await api.post<SubmitQuizResponseResponse>(
        `/projects/${projectId}/learn/quizzes/${quizId}/sections/${sectionId}/questions/${questionId}/submit`,
        { answer }
      );
      return res.data;
    },
    onSuccess: (data) => {
      // Refetch section questions to update submitted status
      qc.invalidateQueries({
        queryKey: learnKeys.quizSectionQuestions(
          projectId,
          quizId,
          sectionId
        ),
      });

      // If section completed, refetch quiz progress
      if (data.sectionCompleted) {
        qc.invalidateQueries({
          queryKey: learnKeys.quizProgress(projectId, quizId),
        });
      }
    },
  });
}

// POST /learn/quizzes/:quizId/complete
export function useCompleteQuiz(projectId: string, quizId: string) {
  const qc = useQueryClient();
  return useMutation<CompleteQuizResponse, AxiosError<ApiError>>({
    mutationFn: async () => {
      const res = await api.post<CompleteQuizResponse>(
        `/projects/${projectId}/learn/quizzes/${quizId}/complete`
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: learnKeys.quizProgress(projectId, quizId),
      });
      qc.invalidateQueries({
        queryKey: learnKeys.quizResult(projectId, quizId),
      });
      qc.invalidateQueries({
        queryKey: learnKeys.progress(projectId),
      });
    },
  });
}

// GET /learn/quizzes/:quizId/result
export function useQuizResult(
  projectId: string,
  quizId: string | null,
  options?: { enabled?: boolean; refetchInterval?: number | false }
) {
  return useQuery<GetQuizResultResponse, AxiosError<ApiError>>({
    queryKey: learnKeys.quizResult(projectId, quizId ?? ""),
    queryFn: async () => {
      const res = await api.get<GetQuizResultResponse>(
        `/projects/${projectId}/learn/quizzes/${quizId}/result`
      );
      return res.data;
    },
    enabled: (options?.enabled ?? true) && !!projectId && !!quizId,
    // Poll while grading — caller can set refetchInterval
    refetchInterval: options?.refetchInterval ?? false,
  });
}

export function useCompleteCourseSection(
  projectId: string,
  courseId: string,
  sectionId: string
) {
  const qc = useQueryClient();
  return useMutation<CompleteCourseSectionResponse, AxiosError<ApiError>>({
    mutationFn: async () => {
      const res = await api.post<CompleteCourseSectionResponse>(
        `/projects/${projectId}/learn/courses/${courseId}/sections/${sectionId}/complete`
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: learnKeys.courseSectionQuestions(projectId, courseId, sectionId),
      });
      qc.invalidateQueries({
        queryKey: learnKeys.courseProgress(projectId, courseId),
      });
      qc.invalidateQueries({
        queryKey: learnKeys.progress(projectId),
      });
    },
  });
}
// ─── Exported Keys (for external invalidation if needed) ─────────

export { learnKeys };
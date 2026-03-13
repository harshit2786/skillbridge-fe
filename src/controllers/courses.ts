// src/controllers/courses.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type {
  CourseListResponse,
  CourseDetailResponse,
  CreateCourseRequest,
  CreateCourseResponse,
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

export function useCourses(projectId: string) {
  return useQuery<CourseListResponse, AxiosError<ApiError>>({
    queryKey: ["projects", projectId, "courses"],
    queryFn: async () => {
      const res = await api.get<CourseListResponse>(
        `/projects/${projectId}/courses`
      );
      return res.data;
    },
    enabled: !!projectId,
  });
}

export function useCourseDetail(projectId: string, courseId: string | null) {
  return useQuery<CourseDetailResponse, AxiosError<ApiError>>({
    queryKey: ["projects", projectId, "courses", courseId],
    queryFn: async () => {
      const res = await api.get<CourseDetailResponse>(
        `/projects/${projectId}/courses/${courseId}`
      );
      return res.data;
    },
    enabled: !!projectId && !!courseId,
  });
}

export function useCreateCourse(projectId: string) {
  const qc = useQueryClient();
  return useMutation<CreateCourseResponse, AxiosError<ApiError>, CreateCourseRequest>({
    mutationFn: async (data) => {
      const res = await api.post<CreateCourseResponse>(
        `/projects/${projectId}/courses`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "courses"] });
    },
  });
}

export function useCourseAddCreators(projectId: string, courseId: string) {
  const qc = useQueryClient();
  return useMutation<AddCreatorsResponse, AxiosError<ApiError>, AddCreatorsRequest>({
    mutationFn: async (data) => {
      const res = await api.post<AddCreatorsResponse>(
        `/projects/${projectId}/courses/${courseId}/creators`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "courses", courseId] });
      qc.invalidateQueries({ queryKey: ["projects", projectId, "courses"] });
    },
  });
}

export function useCourseRemoveCreator(projectId: string, courseId: string) {
  const qc = useQueryClient();
  return useMutation<RemoveCreatorResponse, AxiosError<ApiError>, string>({
    mutationFn: async (trainerId) => {
      const res = await api.delete<RemoveCreatorResponse>(
        `/projects/${projectId}/courses/${courseId}/creators/${trainerId}`
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "courses", courseId] });
      qc.invalidateQueries({ queryKey: ["projects", projectId, "courses"] });
    },
  });
}

export function useCourseTogglePublish(projectId: string, courseId: string) {
  const qc = useQueryClient();
  return useMutation<TogglePublishResponse, AxiosError<ApiError>>({
    mutationFn: async () => {
      const res = await api.patch<TogglePublishResponse>(
        `/projects/${projectId}/courses/${courseId}/publish`
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "courses", courseId] });
      qc.invalidateQueries({ queryKey: ["projects", projectId, "courses"] });
    },
  });
}

// --- Course Sections ---

export function useCreateCourseSection(projectId: string, courseId: string) {
  const qc = useQueryClient();
  return useMutation<CreateSectionResponse, AxiosError<ApiError>, CreateSectionRequest>({
    mutationFn: async (data) => {
      const res = await api.post<CreateSectionResponse>(
        `/projects/${projectId}/courses/${courseId}/sections`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "courses", courseId] });
    },
  });
}

export function useUpdateCourseSection(projectId: string, courseId: string, sectionId: string) {
  const qc = useQueryClient();
  return useMutation<UpdateSectionResponse, AxiosError<ApiError>, UpdateSectionRequest>({
    mutationFn: async (data) => {
      const res = await api.patch<UpdateSectionResponse>(
        `/projects/${projectId}/courses/${courseId}/sections/${sectionId}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "courses", courseId] });
    },
  });
}

export function useDeleteCourseSection(projectId: string, courseId: string) {
  const qc = useQueryClient();
  return useMutation<DeleteSectionResponse, AxiosError<ApiError>, string>({
    mutationFn: async (sectionId) => {
      const res = await api.delete<DeleteSectionResponse>(
        `/projects/${projectId}/courses/${courseId}/sections/${sectionId}`
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "courses", courseId] });
    },
  });
}

export function useReorderCourseSections(projectId: string, courseId: string) {
  const qc = useQueryClient();
  return useMutation<ReorderSectionsResponse, AxiosError<ApiError>, ReorderSectionsRequest>({
    mutationFn: async (data) => {
      const res = await api.put<ReorderSectionsResponse>(
        `/projects/${projectId}/courses/${courseId}/sections/reorder`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId, "courses", courseId] });
    },
  });
}
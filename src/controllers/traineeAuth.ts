// src/controllers/traineeAuth.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  TraineeMeResponse,
  UpdateTraineeRequest,
  UpdateTraineeResponse,
  ApiError,
} from "../models/types";
import type { AxiosError } from "axios";

export function useSendOtp() {
  return useMutation<SendOtpResponse, AxiosError<ApiError>, SendOtpRequest>({
    mutationFn: async (data) => {
      const response = await api.post<SendOtpResponse>("/trainee/send-otp", data);
      return response.data;
    },
  });
}

export function useVerifyOtp() {
  return useMutation<VerifyOtpResponse, AxiosError<ApiError>, VerifyOtpRequest>({
    mutationFn: async (data) => {
      const response = await api.post<VerifyOtpResponse>("/trainee/verify-otp", data);
      return response.data;
    },
  });
}

export function useTraineeMe(enabled: boolean = true) {
  return useQuery<TraineeMeResponse, AxiosError<ApiError>>({
    queryKey: ["trainee", "me"],
    queryFn: async () => {
      const response = await api.get<TraineeMeResponse>("/trainee/me");
      return response.data;
    },
    enabled,
  });
}

export function useUpdateTrainee() {
  return useMutation<UpdateTraineeResponse, AxiosError<ApiError>, UpdateTraineeRequest>({
    mutationFn: async (data) => {
      const response = await api.patch<UpdateTraineeResponse>("/trainee/me", data);
      return response.data;
    },
  });
}
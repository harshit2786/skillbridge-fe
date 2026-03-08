// src/controllers/trainerAuth.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type {
  TrainerLoginRequest,
  TrainerLoginResponse,
  TrainerMeResponse,
  ApiError,
} from "../models/types";
import type { AxiosError } from "axios";

export function useTrainerLogin() {
  return useMutation<TrainerLoginResponse, AxiosError<ApiError>, TrainerLoginRequest>({
    mutationFn: async (data) => {
      const response = await api.post<TrainerLoginResponse>("/trainer/login", data);
      return response.data;
    },
  });
}

export function useTrainerMe(enabled: boolean = true) {
  return useQuery<TrainerMeResponse, AxiosError<ApiError>>({
    queryKey: ["trainer", "me"],
    queryFn: async () => {
      const response = await api.get<TrainerMeResponse>("/trainer/me");
      return response.data;
    },
    enabled,
  });
}
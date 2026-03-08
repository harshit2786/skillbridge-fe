// src/models/types.ts

// --- Auth Payloads ---

export interface TrainerLoginRequest {
  email: string;
  password: string;
}

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface UpdateTraineeRequest {
  name: string;
}

// --- Entities ---

export interface ProjectRef {
  id: string;
  name: string;
}

export interface Trainer {
  id: string;
  email: string;
  name: string;
  projects_trainer?: ProjectRef[];
  project_admin?: ProjectRef[];
}

export interface Trainee {
  id: string;
  phone: string;
  name: string | null;
  projects_trainee?: ProjectRef[];
}

// --- Auth Responses ---

export interface TrainerLoginResponse {
  message: string;
  token: string;
  trainer: Trainer;
}

export interface TrainerMeResponse {
  trainer: Trainer;
}

export interface SendOtpResponse {
  message: string;
}

export interface VerifyOtpResponse {
  message: string;
  isNewUser: boolean;
  token: string;
  trainee: Trainee;
}

export interface TraineeMeResponse {
  trainee: Trainee;
}

export interface UpdateTraineeResponse {
  message: string;
  trainee: Trainee;
}

// --- Unified Auth User (used in context) ---

export type UserRole = "trainer" | "trainee";

export interface AuthUser {
  role: UserRole;
  token: string;
  trainer?: Trainer;
  trainee?: Trainee;
}

// --- API Error ---

export interface ApiError {
  message: string;
}

export interface Project {
  id: string;
  name: string;
}
// src/api/axios.ts

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch {
        // malformed JSON, ignore
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unauthenticated endpoints that should not trigger a logout on 401
const publicEndpoints = [
  "/trainer/login",
  "/trainee/send-otp",
  "/trainee/verify-otp",
];

// Response interceptor: handle 401 globally (only for authenticated routes)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isPublic = publicEndpoints.some((ep) => requestUrl.includes(ep));

    if (error.response?.status === 401 && !isPublic) {
      localStorage.removeItem("auth");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
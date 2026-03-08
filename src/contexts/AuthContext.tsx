/* eslint-disable react-hooks/set-state-in-effect */
// src/contexts/AuthContext.tsx

import {
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useTrainerMe } from "../controllers/trainerAuth";
import { useTraineeMe } from "../controllers/traineeAuth";
import type {
  AuthUser,
  Trainer,
  Trainee,
} from "../models/types";
import { AuthContext } from "@/hooks/useAuth";

// --- Context Shape ---

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  loginTrainer: (token: string, trainer: Trainer) => void;
  loginTrainee: (token: string, trainee: Trainee) => void;
  updateTrainee: (trainee: Trainee) => void;
  logout: () => void;
}


// --- Provider Props ---

interface AuthProviderProps {
  traineeRoutes: ReactNode;
  trainerRoutes: ReactNode;
  loginPage: ReactNode;
}

// --- Provider ---

export function AuthProvider({
  traineeRoutes,
  trainerRoutes,
  loginPage,
}: AuthProviderProps) {
  const [stored, setStored] = useLocalStorage<AuthUser | null>("auth", null);
  const [user, setUser] = useState<AuthUser | null>(stored);
  const queryClient = useQueryClient();

  // Validate token on mount using useQuery
  const isTrainer = stored?.role === "trainer" && !!stored?.token;
  const isTrainee = stored?.role === "trainee" && !!stored?.token;

  const trainerMe = useTrainerMe(isTrainer);
  const traineeMe = useTraineeMe(isTrainee);

  // Derive loading state
  const isLoading =
    (isTrainer && trainerMe.isLoading) ||
    (isTrainee && traineeMe.isLoading);

  // Sync trainer validation result
  useEffect(() => {
    if (!isTrainer) return;

    if (trainerMe.isSuccess && trainerMe.data) {
      setUser((prev) => {
        if (!prev) return prev;
        return { ...prev, trainer: trainerMe.data.trainer };
      });
    }

    if (trainerMe.isError) {
      setStored(null);
      setUser(null);
    }
  }, [isTrainer, trainerMe.isSuccess, trainerMe.isError, trainerMe.data, setStored]);

  // Sync trainee validation result
  useEffect(() => {
    if (!isTrainee) return;

    if (traineeMe.isSuccess && traineeMe.data) {
      setUser((prev) => {
        if (!prev) return prev;
        return { ...prev, trainee: traineeMe.data.trainee };
      });
    }

    if (traineeMe.isError) {
      setStored(null);
      setUser(null);
    }
  }, [isTrainee, traineeMe.isSuccess, traineeMe.isError, traineeMe.data, setStored]);

  const loginTrainer = useCallback(
    (token: string, trainer: Trainer) => {
      const authUser: AuthUser = { role: "trainer", token, trainer };
      setStored(authUser);
      setUser(authUser);
    },
    [setStored]
  );

  const loginTrainee = useCallback(
    (token: string, trainee: Trainee) => {
      const authUser: AuthUser = { role: "trainee", token, trainee };
      setStored(authUser);
      setUser(authUser);
    },
    [setStored]
  );

  const updateTrainee = useCallback(
    (trainee: Trainee) => {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, trainee };
        setStored(updated);
        return updated;
      });
      // Invalidate the cached trainee/me query so it refetches
      queryClient.invalidateQueries({ queryKey: ["trainee", "me"] });
    },
    [setStored, queryClient]
  );

  const logout = useCallback(() => {
    setStored(null);
    setUser(null);
    queryClient.clear();
  }, [setStored, queryClient]);

  const value: AuthContextValue = {
    user,
    isLoading,
    loginTrainer,
    loginTrainee,
    updateTrainee,
    logout,
  };

  // --- Render ---

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {!user
        ? loginPage
        : user.role === "trainee"
          ? traineeRoutes
          : trainerRoutes}
    </AuthContext.Provider>
  );
}


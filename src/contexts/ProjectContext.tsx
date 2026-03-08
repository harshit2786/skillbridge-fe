import {
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import type { ProjectDetail, Trainee, Trainer, UserRole } from "../models/types";
import { useAuth } from "@/hooks/useAuth";
import { useProjectDetail } from "@/controllers/projects";
import { ProjectContext } from "@/hooks/useProject";

// --- Context Shape ---

// --- Context Shape ---

export interface ProjectContextValue {
  project: ProjectDetail;
  role: UserRole;
  currentTrainer: Trainer | null;
  currentTrainee: Trainee | null;
  isAdmin: boolean;
  isLoading: boolean;
  refetch: () => void;
}

// --- Provider ---

interface ProjectProviderProps {
  projectId: string;
  children: ReactNode;
}

export function ProjectProvider({ projectId, children }: ProjectProviderProps) {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useProjectDetail(projectId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Failed to load project
          </h2>
          <p className="max-w-xs text-sm text-gray-500">
            {error?.response?.data?.message || "Something went wrong"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const project = data.project;
  const role = user?.role ?? "trainee";
  const currentTrainer = user?.trainer ?? null;
  const currentTrainee = user?.trainee ?? null;
  const isAdmin =
    role === "trainer" &&
    (project.admin?.id === currentTrainer?.id);

  const value: ProjectContextValue = {
    project,
    role,
    currentTrainer,
    currentTrainee,
    isAdmin,
    isLoading,
    refetch,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}
// --- Hook ---


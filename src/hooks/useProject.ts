import type { ProjectContextValue } from "@/contexts/ProjectContext";
import { createContext, useContext } from "react";

export const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined,
);

export function useProject(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

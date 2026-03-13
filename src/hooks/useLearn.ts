import { createContext, useContext } from "react";
import type { LearnContextValue } from "@/contexts/LearnContext";

export const LearnContext = createContext<LearnContextValue | undefined>(
  undefined
);

export function useLearn(): LearnContextValue {
  const context = useContext(LearnContext);
  if (!context) {
    throw new Error("useLearn must be used within a LearnProvider");
  }
  return context;
}
// --- Hook ---

import type { AuthContextValue } from "@/contexts/AuthContext";
import { createContext, useContext } from "react";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
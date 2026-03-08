// src/App.tsx

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import TraineeRoutes from "./routes/TraineeRoutes";
import TrainerRoutes from "./routes/TrainerRoutes";
import LoginPage from "./pages/LoginPage";

// Add new QueryCache
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection / cache time)
    },
  },
  queryCache: new QueryCache(),
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        loginPage={<LoginPage />}
        traineeRoutes={<TraineeRoutes />}
        trainerRoutes={<TrainerRoutes />}
      />
    </QueryClientProvider>
  );
}

// src/routes/TraineeRoutes.tsx

import { useRoutes } from "raviger";
import TraineeDashboard from "../pages/trainee/TraineeDashboard";

const traineeRouteMap = {
  "/": () => <TraineeDashboard />,  
};

export default function TraineeRoutes() {
  const routes = useRoutes(traineeRouteMap);
  return routes || <div>404 — Not Found</div>;
}
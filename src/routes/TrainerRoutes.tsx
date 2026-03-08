// src/routes/TrainerRoutes.tsx

import { useRoutes } from "raviger";
import TrainerDashboard from "../pages/trainer/TrainerDashboard";

const trainerRouteMap = {
  "/": () => <TrainerDashboard />,
};

export default function TrainerRoutes() {
  const routes = useRoutes(trainerRouteMap);
  return routes || <div>404 — Not Found</div>;
}
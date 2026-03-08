// src/routes/TraineeRoutes.tsx

import { useRoutes } from "raviger";
import TraineeDashboard from "../pages/trainee/TraineeDashboard";
import { ProjectProvider } from "../contexts/ProjectContext";
import TraineeProjectRoutes from "./TraineeProjectRoutes";

const traineeRouteMap = {
  "/": () => <TraineeDashboard />,
  "/projects/:projectId": ({ projectId }: { projectId: string }) => (
    <ProjectProvider projectId={projectId}>
      <TraineeProjectRoutes />
    </ProjectProvider>
  ),
  "/projects/:projectId/*": ({ projectId }: { projectId: string }) => (
    <ProjectProvider projectId={projectId}>
      <TraineeProjectRoutes />
    </ProjectProvider>
  ),
};

export default function TraineeRoutes() {
  const routes = useRoutes(traineeRouteMap);
  return routes || <div>404 — Not Found</div>;
}

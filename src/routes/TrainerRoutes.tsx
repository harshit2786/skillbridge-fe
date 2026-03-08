import { useRoutes } from "raviger";
import TrainerDashboard from "../pages/trainer/TrainerDashboard";
import { ProjectProvider } from "../contexts/ProjectContext";
import TrainerProjectRoutes from "./TrainerProjectRoutes";

const trainerRouteMap = {
  "/": () => <TrainerDashboard />,
  "/projects/:projectId": ({ projectId }: { projectId: string }) => (
    <ProjectProvider projectId={projectId}>
      <TrainerProjectRoutes />
    </ProjectProvider>
  ),
  "/projects/:projectId/*": ({ projectId }: { projectId: string }) => (
    <ProjectProvider projectId={projectId}>
      <TrainerProjectRoutes />
    </ProjectProvider>
  ),
};

export default function TrainerRoutes() {
  const routes = useRoutes(trainerRouteMap);
  return routes || <div>404 — Not Found</div>;
}

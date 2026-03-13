import { useRoutes } from "raviger";
import TraineeProjectLayout from "../components/layouts/TraineeProjectLayout";
import TraineeProjectHome from "../pages/trainee/project/TraineeProjectHome";
import TraineeAIPlayground from "../pages/trainee/project/TraineeAIPlayground";
import TraineeWebinars from "../pages/trainee/project/TraineeWebinars";
import TraineeResources from "../pages/trainee/project/TraineeResources";
import TraineeFeedback from "../pages/trainee/project/TraineeFeedback";
import TraineeLearnRoutes from "./TraineeLearnRoutes";

const routeMap = {
  "/projects/:projectId": () => (
    <TraineeProjectLayout>
      <TraineeProjectHome />
    </TraineeProjectLayout>
  ),
  "/projects/:projectId/ai-playground": () => (
    <TraineeProjectLayout>
      <TraineeAIPlayground />
    </TraineeProjectLayout>
  ),
  "/projects/:projectId/webinars": () => (
    <TraineeProjectLayout>
      <TraineeWebinars />
    </TraineeProjectLayout>
  ),
  "/projects/:projectId/resources": () => (
    <TraineeProjectLayout>
      <TraineeResources />
    </TraineeProjectLayout>
  ),
  "/projects/:projectId/feedback": () => (
    <TraineeProjectLayout>
      <TraineeFeedback />
    </TraineeProjectLayout>
  ),
  "/projects/:projectId/learn": () => <TraineeLearnRoutes />,
  // Learn routes — NO TraineeProjectLayout wrapper
  "/projects/:projectId/learn/*": () => <TraineeLearnRoutes />,
};

export default function TraineeProjectRoutes() {
  const routes = useRoutes(routeMap);
  return routes || <div className="p-8">404 — Page not found</div>;
}

import { useRoutes } from "raviger";
import TraineeProjectLayout from "../components/layouts/TraineeProjectLayout";
import TraineeProjectHome from "../pages/trainee/project/TraineeProjectHome";
import TraineeAIPlayground from "../pages/trainee/project/TraineeAIPlayground";
import TraineeWebinars from "../pages/trainee/project/TraineeWebinars";
import TraineeResources from "../pages/trainee/project/TraineeResources";
import TraineeFeedback from "../pages/trainee/project/TraineeFeedback";

const routeMap = {
  "/projects/:projectId": () => <TraineeProjectHome />,
  "/projects/:projectId/ai-playground": () => <TraineeAIPlayground />,
  "/projects/:projectId/webinars": () => <TraineeWebinars />,
  "/projects/:projectId/resources": () => <TraineeResources />,
  "/projects/:projectId/feedback": () => <TraineeFeedback />,
};

export default function TraineeProjectRoutes() {
  const routes = useRoutes(routeMap);

  return (
    <TraineeProjectLayout>
      {routes || <div className="p-8">404 — Page not found</div>}
    </TraineeProjectLayout>
  );
}
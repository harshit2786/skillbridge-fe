import { useRoutes } from "raviger";
import ProjectLayout from "../components/layouts/ProjectLayout";
import ProjectDashboard from "../pages/trainer/project/ProjectDashboard";
import ProjectCourses from "../pages/trainer/project/ProjectCourses";
import ProjectQuizzes from "../pages/trainer/project/ProjectQuizzes";
import ProjectKnowledgeBase from "../pages/trainer/project/ProjectKnowledgeBase";
import ProjectWebinars from "../pages/trainer/project/ProjectWebinars";
import ProjectSettings from "../pages/trainer/project/ProjectSettings";

const routeMap = {
  "/projects/:projectId": () => <ProjectDashboard />,
  "/projects/:projectId/courses": () => <ProjectCourses />,
  "/projects/:projectId/quizzes": () => <ProjectQuizzes />,
  "/projects/:projectId/knowledge-base": () => <ProjectKnowledgeBase />,
  "/projects/:projectId/webinars": () => <ProjectWebinars />,
  "/projects/:projectId/settings": () => <ProjectSettings />,
};

export default function TrainerProjectRoutes() {
  const routes = useRoutes(routeMap);

  return (
    <ProjectLayout>
      {routes || <div className="p-8">404 — Page not found</div>}
    </ProjectLayout>
  );
}
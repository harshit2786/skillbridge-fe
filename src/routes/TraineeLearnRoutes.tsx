import { useRoutes } from "raviger";
import { LearnProvider } from "@/contexts/LearnContext";
import LearnHome from "@/pages/trainee/learn/LearnHome";
import LearnContent from "@/pages/trainee/learn/LearnContent";
import LearnSection from "@/pages/trainee/learn/LearnSection";

const learnRouteMap = {
  "/projects/:projectId/learn": () => <LearnHome />,
  "/projects/:projectId/learn/:contentId": ({
    contentId,
  }: {
    contentId: string;
  }) => <LearnContent contentId={contentId} />,
  "/projects/:projectId/learn/:contentId/:sectionId": ({
    contentId,
    sectionId,
  }: {
    contentId: string;
    sectionId: string;
  }) => <LearnSection contentId={contentId} sectionId={sectionId} />,
};

export default function TraineeLearnRoutes() {
  const routes = useRoutes(learnRouteMap);

  return (
    <LearnProvider>
      {routes || <div className="p-8">404 — Page not found</div>}
    </LearnProvider>
  );
}
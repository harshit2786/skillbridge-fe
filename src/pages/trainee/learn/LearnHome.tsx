import { navigate } from "raviger";
import { Play, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLearn } from "@/hooks/useLearn";
import { useStartLearning } from "@/controllers/learn";

export default function LearnHome() {
  const { projectId, isStarted, currentContentId, contents } = useLearn();
  const startMutation = useStartLearning(projectId);
  const basePath = `/projects/${projectId}/learn`;

  // If already started, redirect to current content
  if (isStarted && currentContentId) {
    navigate(`${basePath}/${currentContentId}`, { replace: true });
    return null;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50">
          <BookOpen className="h-9 w-9 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ready to start learning?
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500">
            You have {contents.length} item{contents.length !== 1 ? "s" : ""}{" "}
            to work through. Click below to begin your learning journey.
          </p>
        </div>
        <Button
          onClick={() =>
            startMutation.mutate(undefined, {
              onSuccess: (data) => {
                const firstContentId = data.progress.currentContentId;
                if (firstContentId) {
                  navigate(`${basePath}/${firstContentId}`);
                }
              },
            })
          }
          disabled={startMutation.isPending}
          size="lg"
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          {startMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Start Learning
        </Button>
      </div>
    </div>
  );
}
import { navigate } from "raviger";
import {
  Loader2,
  Play,
  CheckCircle2,
  Lock,
  ChevronRight,
  BookOpen,
  FileQuestion,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLearn } from "@/hooks/useLearn";
import {
  useContentDetails,
  useCourseLearnProgress,
  useQuizLearnProgress,
} from "@/controllers/learn";
import LearnLayout from "@/components/layouts/LearnLayout";

interface Props {
  contentId: string;
}

export default function LearnContent({ contentId }: Props) {
  const { projectId } = useLearn();
  const basePath = `/projects/${projectId}/learn`;
  const [isStarting, setIsStarting] = useState(false);

  const { data, isLoading } = useContentDetails(projectId, contentId);

  const isCourse = data?.content.type === "COURSE";
  const courseId = data?.content.course?.id ?? null;
  const quizId = data?.content.quiz?.id ?? null;

  // These hooks auto-create progress/attempt when called
  const { refetch: refetchCourseProgress } = useCourseLearnProgress(
    projectId,
    isCourse ? courseId : null
  );
  const { refetch: refetchQuizProgress } = useQuizLearnProgress(
    projectId,
    !isCourse ? quizId : null
  );

  if (isLoading) {
    return (
      <LearnLayout activeContentId={contentId}>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </LearnLayout>
    );
  }

  if (!data) {
    return (
      <LearnLayout activeContentId={contentId}>
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">Content not found</p>
        </div>
      </LearnLayout>
    );
  }

  const { content, progress, started } = data;
  const entity = content.type === "COURSE" ? content.course : content.quiz;
  const sections = entity?.sections ?? [];

  const currentSectionOrder =
    progress && "currentSectionOrder" in progress
      ? progress.currentSectionOrder
      : 0;

  const handleStartOrContinue = async () => {
    const targetSection = started
      ? sections.find((s) => s.order === currentSectionOrder) ?? sections[0]
      : sections[0];

    if (!targetSection) return;

    if (!started) {
      // Ensure progress/attempt record exists before navigating
      setIsStarting(true);
      try {
        if (content.type === "COURSE") {
          await refetchCourseProgress();
        } else {
          await refetchQuizProgress();
        }
      } catch (e) {
        console.error("Failed to initialize progress:", e);
        setIsStarting(false);
        return;
      }
      setIsStarting(false);
    }

    navigate(`${basePath}/${contentId}/${targetSection.id}`);
  };

  const isCompleted =
    progress &&
    (("status" in progress && progress.status === "COMPLETED") ||
      ("status" in progress && progress.status === "GRADED"));

  return (
    <LearnLayout activeContentId={contentId}>
      <div className="flex h-full items-center justify-center p-8">
        <div className="w-full max-w-lg">
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                isCourse
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-violet-50 text-violet-700"
              }`}
            >
              {isCourse ? (
                <BookOpen className="h-3 w-3" />
              ) : (
                <FileQuestion className="h-3 w-3" />
              )}
              {content.type}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {entity?.name}
          </h1>
          {entity?.description && (
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              {entity.description}
            </p>
          )}

          {/* Quiz passing info */}
          {!isCourse && content.quiz?.passingPercent !== undefined && (
            <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2">
              <p className="text-xs text-amber-700">
                Passing score: {content.quiz.passingPercent}%
              </p>
            </div>
          )}

          {/* Sections list */}
          <div className="mt-8">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Sections ({sections.length})
            </h3>
            <div className="space-y-2">
              {sections.map((section) => {
                const isUnlocked = section.order <= currentSectionOrder;
                const isCurrent =
                  started && section.order === currentSectionOrder;
                const isSectionCompleted =
                  started && section.order < currentSectionOrder;

                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      if (isUnlocked && started) {
                        navigate(
                          `${basePath}/${contentId}/${section.id}`
                        );
                      }
                    }}
                    disabled={!isUnlocked || !started}
                    className={`group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                      isCurrent
                        ? "border-emerald-200 bg-emerald-50 shadow-sm"
                        : isSectionCompleted
                          ? "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          : !isUnlocked || !started
                            ? "border-gray-100 bg-gray-50 opacity-50"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Status icon */}
                    <div className="flex-shrink-0">
                      {isSectionCompleted ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                      ) : isCurrent ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600">
                          <span className="text-xs font-bold text-white">
                            {section.order + 1}
                          </span>
                        </div>
                      ) : isUnlocked ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200">
                          <span className="text-xs font-semibold text-gray-500">
                            {section.order + 1}
                          </span>
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                          <Lock className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Section info */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isCurrent
                            ? "text-emerald-800"
                            : "text-gray-900"
                        }`}
                      >
                        {section.title}
                      </p>
                      {section.description && (
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {section.description}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-gray-400">
                        {section._count.questions} question
                        {section._count.questions !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {isUnlocked && started && (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-gray-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          {!isCompleted && sections.length > 0 && (
            <Button
              onClick={handleStartOrContinue}
              disabled={isStarting}
              size="lg"
              className="mt-6 w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {started ? "Continue" : "Start"}
            </Button>
          )}
        </div>
      </div>
    </LearnLayout>
  );
}
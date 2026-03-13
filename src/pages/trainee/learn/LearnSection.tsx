/* eslint-disable @typescript-eslint/no-explicit-any */
import { navigate } from "raviger";
import { Loader2, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useLearn } from "@/hooks/useLearn";
import {
  useContentDetails,
  useCourseSectionQuestions,
  useQuizSectionQuestions,
  useSubmitCourseAnswer,
  useSubmitQuizResponse,
  useCompleteQuiz,
  useCompleteCourseSection,
} from "@/controllers/learn";
import LearnLayout from "@/components/layouts/LearnLayout";
import QuestionRenderer from "@/components/learn/QuestionRenderer";

interface Props {
  contentId: string;
  sectionId: string;
}

export default function LearnSection({ contentId, sectionId }: Props) {
  const { projectId } = useLearn();

  const { data: contentData, isLoading } = useContentDetails(
    projectId,
    contentId,
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

  if (!contentData) {
    return (
      <LearnLayout activeContentId={contentId}>
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">Content not found</p>
        </div>
      </LearnLayout>
    );
  }

  const { content } = contentData;

  return (
    <LearnLayout activeContentId={contentId}>
      {content.type === "COURSE" ? (
        <CourseSectionView
          projectId={projectId}
          contentId={contentId}
          courseId={content.course!.id}
          sectionId={sectionId}
          sections={content.course!.sections}
        />
      ) : (
        <QuizSectionView
          projectId={projectId}
          contentId={contentId}
          quizId={content.quiz!.id}
          sectionId={sectionId}
          sections={content.quiz!.sections}
        />
      )}
    </LearnLayout>
  );
}

// ─── Course Section View ─────────────────────────────────────────

function CourseSectionView({
  projectId,
  contentId,
  courseId,
  sectionId,
  sections,
}: {
  projectId: string;
  contentId: string;
  courseId: string;
  sectionId: string;
  sections: any[];
}) {
  const basePath = `/projects/${projectId}/learn/${contentId}`;
  const { refetchProgress, contents } = useLearn();

  const { data, isLoading, isError, refetch } = useCourseSectionQuestions(
    projectId,
    courseId,
    sectionId,
  );

  const submitMutation = useSubmitCourseAnswer(projectId, courseId, sectionId);
  const completeSectionMutation = useCompleteCourseSection(
    projectId,
    courseId,
    sectionId,
  );

  const currentSection = sections.find((s: any) => s.id === sectionId);
  const currentIndex = sections.findIndex((s: any) => s.id === sectionId);
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection =
    currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;
  const isLastSection = currentIndex === sections.length - 1;

  const questions = data?.questions ?? [];
  const answerableQuestions = questions.filter(
    (q) => q.type !== "content_block",
  );
  const completedCount = answerableQuestions.filter((q) => q.completed).length;
  const allCompleted =
    answerableQuestions.length === 0 ||
    answerableQuestions.every((q) => q.completed);
  const sectionAutoComplete = data?.sectionAutoComplete ?? false;
  const canProceed =
    !isLoading && questions.length > 0 && (allCompleted || sectionAutoComplete);

  const handleSubmit = async (questionId: string, answer: any) => {
    const result = await submitMutation.mutateAsync({ questionId, answer });
    refetch();

    if (result.courseCompleted) {
      refetchProgress();
    }

    return result;
  };

  const handleNext = () => {
    if (!canProceed) return;

    completeSectionMutation.mutate(undefined, {
      onSuccess: (result) => {
        if (result.courseCompleted) {
          // Find next content by position
          const currentItem = contents.find((c) => c.contentId === contentId);
          const nextItem = currentItem
            ? contents
                .filter((c) => c.position > currentItem.position)
                .sort((a, b) => a.position - b.position)[0]
            : undefined;

          // Refetch after determining navigation target
          refetchProgress();

          if (nextItem) {
            navigate(`/projects/${projectId}/learn/${nextItem.contentId}`);
          } else {
            // This was the last content
            navigate(`/projects/${projectId}/learn/${contentId}`);
          }
        } else if (nextSection) {
          refetchProgress();
          navigate(`${basePath}/${nextSection.id}`);
        }
      },
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Section header */}
      <div className="border-b border-gray-200 bg-white px-8 py-5">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-medium text-emerald-600">
            Section {(currentSection?.order ?? 0) + 1} of {sections.length}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900">
            {currentSection?.title}
          </h2>
          {currentSection?.description && (
            <p className="mt-1 text-sm text-gray-500">
              {currentSection.description}
            </p>
          )}
          {!isLoading && answerableQuestions.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${(completedCount / answerableQuestions.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[11px] text-gray-500">
                {completedCount}/{answerableQuestions.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Questions area */}
      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-gray-500">Failed to load questions</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-6">
            {questions.map((question, idx) => (
              <QuestionRenderer
                key={question.id}
                question={question}
                index={idx}
                mode="course"
                onSubmit={handleSubmit}
                isSubmitting={submitMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation footer */}
      <div className="border-t border-gray-200 bg-white px-8 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <button
            onClick={() =>
              prevSection && navigate(`${basePath}/${prevSection.id}`)
            }
            disabled={!prevSection}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          <div className="flex items-center gap-3">
            {!canProceed && !isLoading && (
              <span className="hidden text-xs text-gray-400 sm:inline">
                Complete all questions to proceed
              </span>
            )}
            <button
              onClick={handleNext}
              disabled={
                !canProceed || isLoading || completeSectionMutation.isPending
              }
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {completeSectionMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : isLastSection ? (
                <>
                  Complete
                  <Send className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Section View ───────────────────────────────────────────

function QuizSectionView({
  projectId,
  contentId,
  quizId,
  sectionId,
  sections,
}: {
  projectId: string;
  contentId: string;
  quizId: string;
  sectionId: string;
  sections: any[];
}) {
  const basePath = `/projects/${projectId}/learn/${contentId}`;
  const { refetchProgress } = useLearn();

  const { data, isLoading, refetch } = useQuizSectionQuestions(
    projectId,
    quizId,
    sectionId,
  );

  const submitMutation = useSubmitQuizResponse(projectId, quizId, sectionId);
  const completeMutation = useCompleteQuiz(projectId, quizId);

  const currentSection = sections.find((s: any) => s.id === sectionId);
  const currentIndex = sections.findIndex((s: any) => s.id === sectionId);
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection =
    currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;
  const isLastSection = currentIndex === sections.length - 1;

  const questions = data?.questions ?? [];
  const answerableQuestions = questions.filter(
    (q) => q.type !== "content_block",
  );
  const submittedCount = answerableQuestions.filter((q) => q.submitted).length;
  const allSubmitted =
    answerableQuestions.length === 0 ||
    answerableQuestions.every((q) => q.submitted);
  const sectionAutoComplete = data?.sectionAutoComplete ?? false;
  const canProceed = allSubmitted || sectionAutoComplete;

  const handleSubmit = async (questionId: string, answer: any) => {
    const result = await submitMutation.mutateAsync({ questionId, answer });
    refetch();
    return result;
  };

  const handleNext = () => {
    if (!canProceed) return;

    if (isLastSection) {
      completeMutation.mutate(undefined, {
        onSuccess: () => {
          refetchProgress();
          navigate(`/projects/${projectId}/learn/${contentId}`);
        },
      });
    } else if (nextSection) {
      navigate(`${basePath}/${nextSection.id}`);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Section header */}
      <div className="border-b border-gray-200 bg-white px-8 py-5">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-medium text-violet-600">
            Section {(currentSection?.order ?? 0) + 1} of {sections.length}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900">
            {currentSection?.title}
          </h2>
          {currentSection?.description && (
            <p className="mt-1 text-sm text-gray-500">
              {currentSection.description}
            </p>
          )}
          {!isLoading && answerableQuestions.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-500"
                  style={{
                    width: `${(submittedCount / answerableQuestions.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[11px] text-gray-500">
                {submittedCount}/{answerableQuestions.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Questions area */}
      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-6">
            {questions.map((question, idx) => (
              <QuestionRenderer
                key={question.id}
                question={question}
                index={idx}
                mode="quiz"
                onSubmit={handleSubmit}
                isSubmitting={submitMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation footer */}
      <div className="border-t border-gray-200 bg-white px-8 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <button
            onClick={() =>
              prevSection && navigate(`${basePath}/${prevSection.id}`)
            }
            disabled={!prevSection}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          <div className="flex items-center gap-3">
            {!canProceed && !isLoading && (
              <span className="hidden text-xs text-gray-400 sm:inline">
                Submit all answers to proceed
              </span>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed || isLoading || completeMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {completeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : isLastSection ? (
                <>
                  Submit Quiz
                  <Send className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

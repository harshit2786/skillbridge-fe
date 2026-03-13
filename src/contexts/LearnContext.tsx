import { useEffect, useMemo, useState, type ReactNode } from "react";
import { navigate } from "raviger";
import { Loader2 } from "lucide-react";
import { useProject } from "@/hooks/useProject";
import { useLearnProgress } from "@/controllers/learn";
import type { GetProgressResponse, SidebarItem } from "@/types/learn";
import { LearnContext } from "@/hooks/useLearn";

// ─── Context Shape ───────────────────────────────────────────────

export interface LearnContextValue {
  projectId: string;
  contents: SidebarItem[];
  currentContentId: string | null;
  progressId: string | null;
  isStarted: boolean;
  /** Finds the SidebarItem for a given contentId */
  getContentItem: (contentId: string) => SidebarItem | undefined;
  /** Finds the SidebarItem by quizId or courseId */
  getContentItemByEntityId: (entityId: string) => SidebarItem | undefined;
  /** Returns the first section ID the trainee should be on for a content */
  refetchProgress: () => void;
}

// ─── Provider ────────────────────────────────────────────────────

interface LearnProviderProps {
  children: ReactNode;
}

export function LearnProvider({ children }: LearnProviderProps) {
  const { project } = useProject();
  const projectId = project.id;
  const basePath = `/projects/${projectId}/learn`;

  const { data, isLoading, isError, error, refetch } =
    useLearnProgress(projectId);

  const [hasRedirected, setHasRedirected] = useState(false);

  // ─── Derive state from progress data ────────────────────────

  const contents = useMemo(() => {
    return data?.contents ?? [];
  }, [data]);
  const currentContentId = data?.progress?.currentContentId ?? null;
  const progressId = data?.progress?.id ?? null;
  const isStarted = data?.progress !== null;

  // ─── Route validation & redirection ─────────────────────────

  useEffect(() => {
    if (isLoading || !data) return;

    // If trainee hasn't started learning, they should only be on /learn
    // The /learn page itself will show a "Start Learning" button
    const currentPath = window.location.pathname;
    const pathAfterLearn = currentPath.replace(basePath, "").replace(/^\//, "");

    // If on exactly /learn (no sub-path), no redirect needed
    if (!pathAfterLearn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasRedirected(true);
      return;
    }

    // If not started, redirect to /learn
    if (!data.progress) {
      navigate(basePath, { replace: true });
      setHasRedirected(true);
      return;
    }

    // Parse the path: expected formats:
    //   /:contentId
    //   /:contentId/:sectionId
    const segments = pathAfterLearn.split("/").filter(Boolean);
    const requestedContentId = segments[0];
    const requestedSectionId = segments[1];

    if (!requestedContentId) {
      setHasRedirected(true);
      return;
    }

    // Validate contentId exists in published contents
    const requestedItem = contents.find(
      (c) => c.contentId === requestedContentId,
    );

    if (!requestedItem) {
      // Garbage contentId — redirect to current content
      redirectToCurrentContent(data, basePath);
      setHasRedirected(true);
      return;
    }

    // Check if content is accessible (not locked)
    if (requestedItem.status === "locked") {
      // Trying to access locked content — redirect to current
      redirectToCurrentContent(data, basePath);
      setHasRedirected(true);
      return;
    }

    // If there's a sectionId, validate it exists
    if (requestedSectionId && segments.length === 2) {
      // We'll let the child pages handle invalid sectionIds
      // since we'd need to fetch section data to validate
      // The section endpoints will return 403/404 and the page can handle it
      setHasRedirected(true);
      return;
    }

    // If more than 2 segments, it's a garbage path
    if (segments.length > 2) {
      redirectToCurrentContent(data, basePath);
      setHasRedirected(true);
      return;
    }

    setHasRedirected(true);
  }, [isLoading, data, basePath, contents]);

  // ─── Helpers ────────────────────────────────────────────────

  const getContentItem = (contentId: string) =>
    contents.find((c) => c.contentId === contentId);

  const getContentItemByEntityId = (entityId: string) =>
    contents.find((c) => c.quiz?.id === entityId || c.course?.id === entityId);

  const value: LearnContextValue = {
    projectId,
    contents,
    currentContentId,
    progressId,
    isStarted,
    getContentItem,
    getContentItemByEntityId,
    refetchProgress: refetch,
  };

  // ─── Loading state ──────────────────────────────────────────

  if (isLoading || !hasRedirected) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-500">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────────

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Failed to load learning progress
          </h2>
          <p className="max-w-xs text-sm text-gray-500">
            {error?.response?.data?.message || "Something went wrong"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <LearnContext.Provider value={value}>{children}</LearnContext.Provider>
  );
}

// ─── Redirect helper ─────────────────────────────────────────────

function redirectToCurrentContent(data: GetProgressResponse, basePath: string) {
  const currentContentId = data.progress?.currentContentId;

  if (!currentContentId) {
    navigate(basePath, { replace: true });
    return;
  }

  navigate(`${basePath}/${currentContentId}`, { replace: true });
}

import { type ReactNode, useState } from "react";
import { navigate } from "raviger";
import {
  ChevronLeft,
  BookOpen,
  FileQuestion,
  CheckCircle2,
  Lock,
  Loader2,
  Clock,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useLearn } from "@/hooks/useLearn";
import { useProject } from "@/hooks/useProject";
import type { ContentStatus, SidebarItem } from "@/types/learn";

interface LearnLayoutProps {
  children: ReactNode;
  activeContentId?: string;
}

export default function LearnLayout({
  children,
  activeContentId,
}: LearnLayoutProps) {
  const { projectId, contents, currentContentId } = useLearn();
  const { project } = useProject();
  const [collapsed, setCollapsed] = useState(false);

  const basePath = `/projects/${projectId}/learn`;

  const handleContentClick = (item: SidebarItem) => {
    if (item.status === "locked") return;
    navigate(`${basePath}/${item.contentId}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ===== Sidebar ===== */}
      <aside
        className={`relative flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
          collapsed ? "w-0 overflow-hidden" : "w-80"
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="mb-3 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-3 w-3" />
            Back to Project
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-gray-900">
                {project.name}
              </h2>
              <p className="text-[11px] text-gray-500">Learning Path</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="border-b border-gray-200 px-4 py-3">
          <ProgressBar contents={contents} />
        </div>

        {/* Content list */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {contents.map((item, index) => (
              <ContentCard
                key={item.contentId}
                item={item}
                index={index}
                isActive={activeContentId === item.contentId}
                isCurrent={item.contentId === currentContentId}
                onClick={() => handleContentClick(item)}
              />
            ))}
          </div>
        </nav>
      </aside>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-r-lg border border-l-0 border-gray-200 bg-white p-1.5 text-gray-400 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-600"
        style={{
          left: collapsed ? "0px" : "calc(20rem - 1px)",
          transition: "left 300ms",
        }}
      >
        {collapsed ? (
          <PanelLeft className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </button>

      {/* ===== Main Content ===== */}
      <main className="relative flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────

function ProgressBar({ contents }: { contents: SidebarItem[] }) {
  const total = contents.length;
  const completed = contents.filter(
    (c) => c.status === "completed"
  ).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-medium text-gray-600">
          Progress
        </span>
        <span className="text-[11px] font-semibold text-emerald-600">
          {completed}/{total} completed
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ─── Content Card ────────────────────────────────────────────────

function ContentCard({
  item,
  index,
  isActive,
  isCurrent,
  onClick,
}: {
  item: SidebarItem;
  index: number;
  isActive: boolean;
  isCurrent: boolean;
  onClick: () => void;
}) {
  const isLocked = item.status === "locked";
  const name =
    item.type === "COURSE"
      ? item.course?.name
      : item.quiz?.name;

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
        isActive
          ? "bg-emerald-50 ring-1 ring-emerald-200"
          : isLocked
            ? "cursor-not-allowed opacity-50"
            : "hover:bg-gray-50"
      }`}
    >
      {/* Index / Status indicator */}
      <div className="flex-shrink-0">
        <StatusBadge status={item.status} index={index} isActive={isActive} />
      </div>

      {/* Content info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {item.type === "COURSE" ? (
            <BookOpen
              className={`h-3 w-3 flex-shrink-0 ${
                isActive ? "text-emerald-600" : "text-gray-400"
              }`}
            />
          ) : (
            <FileQuestion
              className={`h-3 w-3 flex-shrink-0 ${
                isActive ? "text-emerald-600" : "text-gray-400"
              }`}
            />
          )}
          <span
            className={`truncate text-xs font-medium ${
              isActive ? "text-emerald-800" : "text-gray-700"
            }`}
          >
            {name}
          </span>
        </div>

        {/* Subtitle */}
        <div className="mt-0.5 flex items-center gap-2">
          <span
            className={`text-[10px] ${
              isActive ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            {item.type === "COURSE" ? "Course" : "Quiz"}
          </span>

          {/* Status text */}
          <StatusText status={item.status} item={item} />
        </div>
      </div>

      {/* Current indicator */}
      {isCurrent && !isActive && (
        <div className="flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
        </div>
      )}

      {!isLocked && !isActive && (
        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}

// ─── Status Badge ────────────────────────────────────────────────

function StatusBadge({
  status,
  index,
  isActive,
}: {
  status: ContentStatus;
  index: number;
  isActive: boolean;
}) {
  const base = "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold";

  switch (status) {
    case "completed":
      return (
        <div className={`${base} bg-emerald-100`}>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
      );

    case "grading":
      return (
        <div className={`${base} bg-amber-50`}>
          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
        </div>
      );

    case "in_progress":
      return (
        <div
          className={`${base} ${
            isActive
              ? "bg-emerald-600 text-white"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {index + 1}
        </div>
      );

    case "available":
      return (
        <div
          className={`${base} ${
            isActive
              ? "bg-emerald-600 text-white"
              : "border border-emerald-200 bg-white text-emerald-600"
          }`}
        >
          {index + 1}
        </div>
      );

    case "locked":
    default:
      return (
        <div className={`${base} bg-gray-100`}>
          <Lock className="h-3.5 w-3.5 text-gray-400" />
        </div>
      );
  }
}

// ─── Status Text ─────────────────────────────────────────────────

function StatusText({
  status,
  item,
}: {
  status: ContentStatus;
  item: SidebarItem;
}) {
  switch (status) {
    case "completed": {
      // Show score for quizzes
      if (
        item.type === "QUIZ" &&
        item.totalScore !== null &&
        item.totalScore !== undefined &&
        item.maxScore
      ) {
        const percent = Math.round((item.totalScore / item.maxScore) * 100);
        return (
          <span
            className={`text-[10px] font-medium ${
              item.passed ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {percent}% • {item.passed ? "Passed" : "Failed"}
          </span>
        );
      }
      return (
        <span className="text-[10px] font-medium text-emerald-600">
          Completed
        </span>
      );
    }

    case "grading":
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600">
          <Clock className="h-2.5 w-2.5" />
          Grading...
        </span>
      );

    case "in_progress":
      return (
        <span className="text-[10px] font-medium text-blue-600">
          In Progress
        </span>
      );

    case "available":
      return (
        <span className="text-[10px] text-gray-400">Not started</span>
      );

    case "locked":
      return (
        <span className="text-[10px] text-gray-400">Locked</span>
      );

    default:
      return null;
  }
}
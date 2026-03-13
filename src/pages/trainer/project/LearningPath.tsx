// src/pages/trainer/project/LearningPath.tsx

import { useState } from "react";
import { navigate } from "raviger";
import {
  useProjectContents,
  useReorderContents,
} from "../../../controllers/contents";
import { Button } from "../../../components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronLeft,
  GripVertical,
  BookOpen,
  FileQuestion,
  CheckCircle2,
  XCircle,
  Route,
  Loader2,
  X,
  Users,
  ArrowDown,
} from "lucide-react";
import type { ProjectContent } from "../../../models/types";
import { useProject } from "@/hooks/useProject";

export default function LearningPath() {
  const { project, isAdmin } = useProject();
  const { data, isLoading, isError } = useProjectContents(project.id);
  const reorderContents = useReorderContents(project.id);

  const serverContents = data?.contents ?? [];

  const [localContents, setLocalContents] = useState<ProjectContent[] | null>(
    null
  );
  const [hasReordered, setHasReordered] = useState(false);

  const contents = localContents ?? serverContents;

  // Sync from server
  const serverKey = serverContents.map((c) => c.id).join(",");
  const [lastServerKey, setLastServerKey] = useState("");
  if (serverKey !== lastServerKey && !hasReordered) {
    setLocalContents(null);
    setLastServerKey(serverKey);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isAdmin) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = contents.findIndex((c) => c.id === active.id);
    const newIndex = contents.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(contents, oldIndex, newIndex);
    setLocalContents(reordered);
    setHasReordered(true);
  };

  const handleSaveOrder = () => {
    if (!localContents) return;
    reorderContents.mutate(
      {
        order: localContents.map((c, i) => ({
          contentId: c.id,
          position: i,
        })),
      },
      {
        onSuccess: () => {
          setHasReordered(false);
          setLocalContents(null);
        },
      }
    );
  };

  const handleDiscardOrder = () => {
    setLocalContents(null);
    setHasReordered(false);
  };

  const basePath = `/projects/${project.id}`;

  const totalCourses = contents.filter((c) => c.type === "COURSE").length;
  const totalQuizzes = contents.filter((c) => c.type === "QUIZ").length;
  const publishedCount = contents.filter(
    (c) =>
      (c.type === "COURSE" && c.course?.published) ||
      (c.type === "QUIZ" && c.quiz?.published)
  ).length;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Back */}
      <button
        onClick={() => navigate(basePath)}
        className="mb-4 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-3 w-3" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
            <Route className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Learning Path</h1>
            <p className="text-sm text-gray-500">
              {isAdmin
                ? "Drag to reorder the sequence trainees will follow"
                : "The sequence trainees will follow in this project"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span className="text-2xl font-bold text-gray-900">
              {totalCourses}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Courses</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <FileQuestion className="h-4 w-4 text-amber-500" />
            <span className="text-2xl font-bold text-gray-900">
              {totalQuizzes}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Quizzes</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-2xl font-bold text-gray-900">
              {publishedCount}/{contents.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Published</p>
        </div>
      </div>

      {/* Reorder Actions */}
      {hasReordered && isAdmin && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-medium text-emerald-700">
            You have unsaved changes to the learning path order
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={handleDiscardOrder}
              disabled={reorderContents.isPending}
            >
              <X className="h-3.5 w-3.5" />
              Discard
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleSaveOrder}
              disabled={reorderContents.isPending}
            >
              {reorderContents.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Save Order
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Failed to load learning path
        </div>
      )}

      {/* Empty State */}
      {contents.length === 0 && !isLoading && (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <Route className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No learning path defined
          </h3>
          <p className="mt-1 max-w-sm text-center text-sm text-gray-500">
            Create courses and quizzes first, then they'll appear here
            automatically for you to arrange in order.
          </p>
        </div>
      )}

      {/* Content Timeline */}
      {contents.length > 0 && (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[39px] top-0 h-full w-px bg-gray-200" />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={contents.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
              disabled={!isAdmin}
            >
              <div className="space-y-4">
                {contents.map((content, idx) => (
                  <SortableContentCard
                    key={content.id}
                    content={content}
                    index={idx}
                    total={contents.length}
                    isAdmin={isAdmin}
                    basePath={basePath}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* End marker */}
          <div className="relative mt-4 flex items-center gap-4 pl-[26px]">
            <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-50">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600">
              Learning path complete
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sortable Content Card ---

function SortableContentCard({
  content,
  index,
  total,
  isAdmin,
  basePath,
}: {
  content: ProjectContent;
  index: number;
  total: number;
  isAdmin: boolean;
  basePath: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: content.id, disabled: !isAdmin });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCourse = content.type === "COURSE";
  const item = isCourse ? content.course : content.quiz;
  const isPublished = item?.published ?? false;

  const handleClick = () => {
    if (isCourse) {
      navigate(`${basePath}/courses/${content.courseId}`);
    } else {
      navigate(`${basePath}/quizzes/${content.quizId}`);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative flex items-start gap-4 pl-[26px]">
      {/* Timeline node */}
      <div
        className={`relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
          isCourse
            ? "border-blue-400 bg-blue-50 text-blue-600"
            : "border-amber-400 bg-amber-50 text-amber-600"
        } ${isDragging ? "ring-4 ring-emerald-200" : ""}`}
      >
        {index + 1}
      </div>

      {/* Card */}
      <div
        className={`flex-1 rounded-xl border bg-white transition-all ${
          isDragging
            ? "z-50 border-emerald-300 shadow-lg shadow-emerald-100"
            : "border-gray-200 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3 p-4">
          {/* Drag handle */}
          {isAdmin && (
            <button
              {...attributes}
              {...listeners}
              className={`cursor-grab rounded p-1 text-gray-300 transition-colors hover:text-gray-500 active:cursor-grabbing ${
                isDragging ? "text-emerald-500" : ""
              }`}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}

          {/* Icon */}
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
              isCourse ? "bg-blue-50" : "bg-amber-50"
            }`}
          >
            {isCourse ? (
              <BookOpen className="h-5 w-5 text-blue-500" />
            ) : (
              <FileQuestion className="h-5 w-5 text-amber-500" />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-gray-900">
                {item?.name ?? "Untitled"}
              </h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  isCourse
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {isCourse ? "Course" : "Quiz"}
              </span>
              {isPublished ? (
                <span className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Published
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                  <XCircle className="h-2.5 w-2.5" />
                  Draft
                </span>
              )}
            </div>
            {item?.description && (
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {item.description}
              </p>
            )}
            {item?.creators && item.creators.length > 0 && (
              <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                <Users className="h-3 w-3" />
                {item.creators.map((c) => c.name).join(", ")}
              </div>
            )}
          </div>

          {/* Open button */}
          <button
            onClick={handleClick}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
          >
            Open →
          </button>
        </div>
      </div>

      {/* Connector arrow */}
      {index < total - 1 && (
        <div className="absolute -bottom-3 left-[35px] z-10">
          <ArrowDown className="h-3 w-3 text-gray-300" />
        </div>
      )}
    </div>
  );
}
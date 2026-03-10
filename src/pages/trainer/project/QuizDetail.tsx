// src/pages/trainer/project/QuizDetail.tsx

import { useState } from "react";
import { navigate } from "raviger";
import {
  useQuizDetail,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useReorderSections,
  useTogglePublish,
  useAddCreators,
  useRemoveCreator,
} from "../../../controllers/quizzes";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Plus,
  ChevronLeft,
  GripVertical,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  Users,
  Search,
  Eye,
  EyeOff,
  FileQuestion,
  ChevronDown,
} from "lucide-react";
import type { QuizSection, Trainer } from "../../../models/types";
import { useProject } from "@/hooks/useProject";
import { useProjectDetail } from "@/controllers/projects";
// src/pages/trainer/project/QuizDetail.tsx

// Replace imports at the top — add these:
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
import { QuizCreator } from "@/components/quiz-components/QuizCreator";
import { useTrainerMe } from "@/controllers/trainerAuth";

// Inside the QuizDetail component, replace the sections-related state and logic:

export default function QuizDetail({ quizId }: { quizId: string }) {
  const { project, isAdmin } = useProject();
  const { data: trainerData } = useTrainerMe();
  const { data, isLoading } = useQuizDetail(project.id, quizId);
  const { data: projectDetail } = useProjectDetail(project.id);
  const togglePublish = useTogglePublish(project.id, quizId);
  //   const createSection = useCreateSection(project.id, quizId);
  const deleteSection = useDeleteSection(project.id, quizId);
  const reorderSections = useReorderSections(project.id, quizId);

  const [showCreateSection, setShowCreateSection] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showCreatorManager, setShowCreatorManager] = useState(false);

  // Local reorder state
  const [localSections, setLocalSections] = useState<QuizSection[] | null>(
    null,
  );
  const [hasReordered, setHasReordered] = useState(false);

  const quiz = data?.quiz;
  const serverSections = [...(quiz?.sections ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  // Use local sections if reordered, otherwise server sections
  const sections = localSections ?? serverSections;

  // Sync from server when data changes and no local edits
  const serverKey = serverSections.map((s) => s.id).join(",");
  const [lastServerKey, setLastServerKey] = useState("");
  if (serverKey !== lastServerKey && !hasReordered) {
    setLocalSections(null);
    setLastServerKey(serverKey);
  }

  const trainers = projectDetail?.project?.trainers ?? [];
  const isCreator = isAdmin || quiz?.creators.some((c) => c.id === trainerData?.trainer?.id);
  console.log("Trainer IDs:", quiz?.creators);
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    const reordered = arrayMove(sections, oldIndex, newIndex);
    setLocalSections(reordered);
    setHasReordered(true);
  };

  const handleSaveOrder = () => {
    if (!localSections) return;
    reorderSections.mutate(
      {
        order: localSections.map((s, i) => ({ sectionId: s.id, order: i })),
      },
      {
        onSuccess: () => {
          setHasReordered(false);
          setLocalSections(null);
        },
      },
    );
  };

  const handleDiscardOrder = () => {
    setLocalSections(null);
    setHasReordered(false);
  };

  const handleDeleteSection = (sectionId: string) => {
    deleteSection.mutate(sectionId, {
      onSuccess: () => {
        setDeleteConfirm(null);
        // Also clear local reorder state if active
        if (hasReordered) {
          setLocalSections(null);
          setHasReordered(false);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Back */}
      <button
        onClick={() => navigate(`/projects/${project.id}/quizzes`)}
        className="mb-4 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-3 w-3" />
        Back to Quizzes
      </button>

      {/* Quiz Header — same as before */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{quiz.name}</h1>
              {quiz.published ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-500">
                  <XCircle className="h-3 w-3" />
                  Draft
                </span>
              )}
            </div>
            {quiz.description && (
              <p className="mt-1 text-sm text-gray-500">{quiz.description}</p>
            )}
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
              <span>Pass: {quiz.passingPercent}%</span>
              <span>•</span>
              <span>
                {sections.length} section{sections.length !== 1 ? "s" : ""}
              </span>
              <span>•</span>
              <span>
                {sections.reduce((sum, s) => sum + s._count.questions, 0)}{" "}
                questions
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setShowCreatorManager(true)}
              >
                <Users className="h-3.5 w-3.5" />
                Creators ({quiz.creators.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => togglePublish.mutate()}
                disabled={togglePublish.isPending}
              >
                {togglePublish.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : quiz.published ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                {quiz.published ? "Unpublish" : "Publish"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sections Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Sections
        </h2>
        <div className="flex items-center gap-2">
          {/* Reorder Save/Discard */}
          {hasReordered && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={handleDiscardOrder}
                disabled={reorderSections.isPending}
              >
                <X className="h-3.5 w-3.5" />
                Discard
              </Button>
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleSaveOrder}
                disabled={reorderSections.isPending}
              >
                {reorderSections.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Save Order
              </Button>
            </>
          )}

          {isCreator && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={() => setShowCreateSection(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Section
            </Button>
          )}
        </div>
      </div>

      {/* Empty Sections */}
      {sections.length === 0 && (
        <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-12">
          <FileQuestion className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">No sections yet</p>
          <p className="mt-0.5 text-xs text-gray-400">
            Add sections to organize your quiz questions
          </p>
          {isCreator && (
            <Button
              size="sm"
              className="mt-4 gap-1.5"
              onClick={() => setShowCreateSection(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add First Section
            </Button>
          )}
        </div>
      )}

      {/* Sortable Section List */}
      {sections.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sections.map((section, idx) => (
                <SortableSectionCard
                  key={section.id}
                  section={section}
                  index={idx}
                  projectId={project.id}
                  quizId={quizId}
                  isCreator={!!isCreator}
                  isEditing={editingSection === section.id}
                  isDeleteConfirm={deleteConfirm === section.id}
                  onEdit={() => setEditingSection(section.id)}
                  onCancelEdit={() => setEditingSection(null)}
                  onDeleteClick={() => setDeleteConfirm(section.id)}
                  onDeleteCancel={() => setDeleteConfirm(null)}
                  onDeleteConfirm={() => handleDeleteSection(section.id)}
                  isDeleting={
                    deleteSection.isPending && deleteConfirm === section.id
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create Section Modal */}
      {showCreateSection && (
        <CreateSectionModal
          projectId={project.id}
          quizId={quizId}
          onClose={() => setShowCreateSection(false)}
        />
      )}

      {/* Creator Manager Modal */}
      {showCreatorManager && quiz && (
        <CreatorManagerModal
          quiz={quiz}
          trainers={trainers}
          projectId={project.id}
          quizId={quizId}
          onClose={() => setShowCreatorManager(false)}
        />
      )}
    </div>
  );
}

// --- Sortable Section Card ---

function SortableSectionCard({
  section,
  index,
  projectId,
  quizId,
  isCreator,
  isEditing,
  isDeleteConfirm,
  onEdit,
  onCancelEdit,
  onDeleteClick,
  onDeleteCancel,
  onDeleteConfirm,
  isDeleting,
}: {
  section: QuizSection;
  index: number;
  projectId: string;
  quizId: string;
  isCreator: boolean;
  isEditing: boolean;
  isDeleteConfirm: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDeleteClick: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, disabled: !isCreator || isEditing });

  const updateSection = useUpdateSection(projectId, quizId, section.id);
  const [editTitle, setEditTitle] = useState(section.title);
  const [editDesc, setEditDesc] = useState(section.description || "");
  const [expanded, setExpanded] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveEdit = () => {
    updateSection.mutate(
      {
        title: editTitle.trim() || undefined,
        description: editDesc.trim() || undefined,
      },
      { onSuccess: () => onCancelEdit() },
    );
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-xl border-2 border-emerald-200 bg-emerald-50/30 p-5"
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-700">Title</Label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-700">Description</Label>
            <Input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Optional description"
              className="h-9 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onCancelEdit}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={updateSection.isPending}
              className="gap-1.5"
            >
              {updateSection.isPending && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border bg-white transition-all ${
        isDragging
          ? "z-50 border-emerald-300 shadow-lg shadow-emerald-100"
          : "border-gray-200"
      }`}
    >
      {/* Section Header */}
      <div className="group flex items-center gap-3 p-5">
        {/* Drag Handle */}
        {isCreator && (
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

        {/* Section Info — clickable to expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-[10px] font-bold text-gray-500">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              {section.title}
            </h3>
            {section.description && (
              <p className="mt-0.5 text-xs text-gray-500">
                {section.description}
              </p>
            )}
          </div>
          <span className="text-[11px] text-gray-400">
            {section._count.questions} question
            {section._count.questions !== 1 ? "s" : ""}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Actions */}
        {isCreator && (
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="rounded-lg p-2 text-gray-400 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>

            {isDeleteConfirm ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-red-600">Delete?</span>
                <button
                  onClick={onDeleteConfirm}
                  disabled={isDeleting}
                  className="rounded-md bg-red-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-red-700"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Yes"
                  )}
                </button>
                <button
                  onClick={onDeleteCancel}
                  className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={onDeleteClick}
                className="rounded-lg p-2 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expanded — Question Creator */}
      {expanded && (
        <div className="border-t border-gray-100">
          <QuizCreator
            projectId={projectId}
            quizId={quizId}
            sectionId={section.id}
            sectionTitle={section.title}
            isCreator={isCreator}
          />
        </div>
      )}
    </div>
  );
}

// --- Create Section Modal ---

function CreateSectionModal({
  projectId,
  quizId,
  onClose,
}: {
  projectId: string;
  quizId: string;
  onClose: () => void;
}) {
  const createSection = useCreateSection(projectId, quizId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Section title is required");
      return;
    }
    createSection.mutate(
      { title: title.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => onClose(),
        onError: (err) => setError(err.response?.data?.message || "Failed"),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">New Section</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Basics"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="h-10 text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSection.isPending}
              className="gap-1.5"
            >
              {createSection.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Creator Manager Modal ---

function CreatorManagerModal({
  quiz,
  trainers,
  projectId,
  quizId,
  onClose,
}: {
  quiz: { creators: { id: string; name: string; email: string }[] };
  trainers: Trainer[];
  projectId: string;
  quizId: string;
  onClose: () => void;
}) {
  const addCreators = useAddCreators(projectId, quizId);
  const removeCreator = useRemoveCreator(projectId, quizId);
  const [search, setSearch] = useState("");

  const creatorIds = new Set(quiz.creators.map((c) => c.id));
  const available = trainers.filter(
    (t) =>
      !creatorIds.has(t.id) &&
      (t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">Manage Creators</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Current Creators */}
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Current Creators ({quiz.creators.length})
          </h3>
          {quiz.creators.length === 0 ? (
            <p className="mb-4 text-xs text-gray-400">No creators assigned</p>
          ) : (
            <div className="mb-4 space-y-2">
              {quiz.creators.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-gray-400">{c.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeCreator.mutate(c.id)}
                    disabled={removeCreator.isPending}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Creators */}
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Add Creators
          </h3>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search trainers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200">
            {available.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-gray-400">
                {search
                  ? "No matching trainers"
                  : "All trainers are already creators"}
              </p>
            ) : (
              available.map((t) => (
                <button
                  key={t.id}
                  onClick={() => addCreators.mutate({ trainerIds: [t.id] })}
                  disabled={addCreators.isPending}
                  className="flex w-full items-center gap-2 border-b border-gray-50 px-3 py-2 text-left text-xs transition-colors last:border-0 hover:bg-emerald-50"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-600">
                    {t.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-700">{t.name}</p>
                    <p className="text-[10px] text-gray-400">{t.email}</p>
                  </div>
                  <Plus className="h-3.5 w-3.5 text-emerald-600" />
                </button>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-3">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
